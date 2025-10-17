<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header info">
        <h3>
          <i class="fa-solid fa-headphones"></i>
          Tạo đề thi {{ testType }} - Listening
        </h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="test-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h4 class="section-title">Thông tin cơ bản</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label>Tên đề thi *</label>
                <input 
                  type="text" 
                  v-model="formData.title" 
                  required 
                  placeholder="VD: IELTS Academic Listening Test 1"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Thời gian (phút) *</label>
                <input 
                  type="number" 
                  v-model="formData.durationMinutes" 
                  required 
                  min="1" 
                  placeholder="40"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>File âm thanh (ID)</label>
                <input 
                  type="number" 
                  v-model="formData.audioFileId" 
                  placeholder="ID file âm thanh chính"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Tải file âm thanh</label>
                <input 
                  type="file" 
                  accept="audio/*"
                  @change="handleAudioUpload"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="formData.description" 
                placeholder="Mô tả chi tiết về đề thi Listening..."
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- Audio Preview -->
          <div v-if="audioFile || formData.audioFileId" class="form-section">
            <h4 class="section-title">
              <i class="fa-solid fa-volume-up"></i>
              File âm thanh
            </h4>
            
            <div class="audio-preview">
              <audio v-if="audioFile" controls class="audio-player">
                <source :src="audioPreviewUrl" type="audio/mpeg">
                Trình duyệt không hỗ trợ phát âm thanh.
              </audio>
              
              <div v-else-if="formData.audioFileId" class="audio-info">
                <i class="fa-solid fa-file-audio"></i>
                <span>File âm thanh ID: {{ formData.audioFileId }}</span>
              </div>
              
              <div class="audio-actions">
                <button type="button" class="btn secondary small" @click="clearAudio">
                  <i class="fa-solid fa-trash"></i>
                  Xóa file
                </button>
              </div>
            </div>
          </div>

          <!-- Listening Parts Section -->
          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                <i class="fa-solid fa-list-ol"></i>
                Listening Parts ({{ formData.listeningParts.length }})
              </h4>
              <button type="button" class="btn-add" @click="addListeningPart">
                <i class="fa-solid fa-plus"></i>
                Thêm Part
              </button>
            </div>

            <div v-if="formData.listeningParts.length === 0" class="empty-state">
              <i class="fa-solid fa-headphones"></i>
              <p>Chưa có Listening Part nào. Hãy thêm Part đầu tiên.</p>
              <button type="button" class="btn primary" @click="addListeningPart">
                <i class="fa-solid fa-plus"></i>
                Thêm Part đầu tiên
              </button>
            </div>

            <div v-for="(part, partIndex) in formData.listeningParts" :key="'part-' + partIndex" class="listening-part-item">
              <div class="item-header">
                <h5>
                  <i class="fa-solid fa-volume-up"></i>
                  Part {{ partIndex + 1 }}
                  <span class="part-info">({{ getTotalQuestionsInPart(part) }} câu hỏi)</span>
                </h5>
                <button type="button" class="btn-remove" @click="removeListeningPart(partIndex)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Số Part</label>
                  <input 
                    type="number" 
                    v-model="part.partNumber" 
                    min="1"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Tiêu đề Part</label>
                  <input 
                    type="text" 
                    v-model="part.title" 
                    placeholder="VD: Social Context"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- Question Groups -->
              <div class="question-groups-subsection">
                <div class="subsection-header">
                  <h6>
                    <i class="fa-solid fa-layer-group"></i>
                    Nhóm câu hỏi ({{ part.questionGroups.length }})
                  </h6>
                  <button type="button" class="btn-add small" @click="addQuestionGroup(partIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm nhóm
                  </button>
                </div>

                <div v-if="part.questionGroups.length === 0" class="empty-state small">
                  <i class="fa-solid fa-layer-group"></i>
                  <p>Chưa có nhóm câu hỏi nào</p>
                </div>

                <div v-for="(group, groupIndex) in part.questionGroups" :key="'group-' + groupIndex" class="question-group-item">
                  <div class="group-header">
                    <h6>
                      <i class="fa-solid fa-folder"></i>
                      Nhóm {{ groupIndex + 1 }}
                      <span class="group-info">({{ group.questions.length }} câu hỏi)</span>
                    </h6>
                    <button type="button" class="btn-remove small" @click="removeQuestionGroup(partIndex, groupIndex)">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Hướng dẫn</label>
                      <textarea 
                        v-model="group.instructionText" 
                        placeholder="Hướng dẫn cho nhóm câu hỏi này..."
                        rows="2"
                        class="form-textarea"
                      ></textarea>
                    </div>
                    <div class="form-group">
                      <label>Thứ tự hiển thị</label>
                      <input 
                        type="number" 
                        v-model="group.displayOrder" 
                        min="1"
                        class="form-input"
                      />
                    </div>
                  </div>

                  <!-- Questions in group -->
                  <div class="questions-subsection">
                    <div class="subsection-header">
                      <h6>
                        <i class="fa-solid fa-question-circle"></i>
                        Câu hỏi ({{ group.questions.length }})
                      </h6>
                      <button type="button" class="btn-add small" @click="addQuestionToGroup(partIndex, groupIndex)">
                        <i class="fa-solid fa-plus"></i>
                        Thêm câu hỏi
                      </button>
                    </div>

                    <div v-if="group.questions.length === 0" class="empty-state small">
                      <i class="fa-solid fa-question-circle"></i>
                      <p>Chưa có câu hỏi nào</p>
                    </div>

                    <div v-for="(question, qIndex) in group.questions" :key="'group-question-' + qIndex" class="question-item">
                      <QuestionForm 
                        :question="question"
                        :question-number="qIndex + 1"
                        @update="updateGroupQuestion(partIndex, groupIndex, qIndex, $event)"
                        @remove="removeGroupQuestion(partIndex, groupIndex, qIndex)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn secondary" @click="$emit('close')">
          <i class="fa-solid fa-times"></i>
          Hủy bỏ
        </button>
        <button type="button" class="btn primary" @click="handleSubmit" :disabled="isSaving">
          <i v-if="isSaving" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-save"></i>
          {{ isSaving ? 'Đang tạo...' : 'Tạo đề thi Listening' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QuestionForm from './QuestionForm.vue'
import { TestDataHelpers } from '@/services/TestAdminAPI.js'

const props = defineProps({
  testType: {
    type: String,
    required: true
  },
  testTypeId: {
    type: Number,
    required: true
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// Form data
const formData = ref({
  title: '',
  description: '',
  durationMinutes: 40,
  testTypeId: props.testTypeId,
  audioFileId: null,
  passages: [],
  listeningParts: []
})

// Audio handling
const audioFile = ref(null)
const audioPreviewUrl = ref('')

const handleAudioUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    audioFile.value = file
    audioPreviewUrl.value = URL.createObjectURL(file)
    // TODO: Upload file to server and get ID
    console.log('Audio file selected:', file.name)
  }
}

const clearAudio = () => {
  audioFile.value = null
  audioPreviewUrl.value = ''
  formData.value.audioFileId = null
  
  // Clear the file input
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) fileInput.value = ''
}

// Listening part management
const addListeningPart = () => {
  const newPart = TestDataHelpers.createEmptyListeningPart(formData.value.listeningParts.length + 1)
  formData.value.listeningParts.push(newPart)
}

const removeListeningPart = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa Listening Part này không?')) {
    formData.value.listeningParts.splice(index, 1)
    // Update part numbers
    formData.value.listeningParts.forEach((part, i) => {
      part.partNumber = i + 1
    })
  }
}

const addQuestionGroup = (partIndex) => {
  const part = formData.value.listeningParts[partIndex]
  const newGroup = TestDataHelpers.createEmptyQuestionGroup(part.questionGroups.length + 1)
  part.questionGroups.push(newGroup)
}

const removeQuestionGroup = (partIndex, groupIndex) => {
  if (confirm('Bạn có chắc chắn muốn xóa nhóm câu hỏi này không?')) {
    formData.value.listeningParts[partIndex].questionGroups.splice(groupIndex, 1)
    // Update display orders
    formData.value.listeningParts[partIndex].questionGroups.forEach((group, i) => {
      group.displayOrder = i + 1
    })
  }
}

const addQuestionToGroup = (partIndex, groupIndex) => {
  const group = formData.value.listeningParts[partIndex].questionGroups[groupIndex]
  const questionNumber = group.questions.length + 1
  const newQuestion = TestDataHelpers.createEmptyQuestion(questionNumber)
  group.questions.push(newQuestion)
}

const removeGroupQuestion = (partIndex, groupIndex, questionIndex) => {
  if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
    formData.value.listeningParts[partIndex].questionGroups[groupIndex].questions.splice(questionIndex, 1)
    // Update question numbers
    formData.value.listeningParts[partIndex].questionGroups[groupIndex].questions.forEach((question, i) => {
      question.questionNumber = i + 1
    })
  }
}

const updateGroupQuestion = (partIndex, groupIndex, questionIndex, questionData) => {
  formData.value.listeningParts[partIndex].questionGroups[groupIndex].questions[questionIndex] = questionData
}

// Utility functions
const getTotalQuestionsInPart = (part) => {
  return part.questionGroups.reduce((total, group) => total + group.questions.length, 0)
}

const handleSubmit = () => {
  // Basic validation
  if (!formData.value.title.trim()) {
    alert('Vui lòng nhập tên đề thi')
    return
  }

  if (formData.value.listeningParts.length === 0) {
    alert('Vui lòng thêm ít nhất 1 Listening Part')
    return
  }

  // Check if all parts have question groups and questions
  for (let i = 0; i < formData.value.listeningParts.length; i++) {
    const part = formData.value.listeningParts[i]
    if (part.questionGroups.length === 0) {
      alert(`Vui lòng thêm ít nhất 1 nhóm câu hỏi cho Part ${i + 1}`)
      return
    }
    
    for (let j = 0; j < part.questionGroups.length; j++) {
      const group = part.questionGroups[j]
      if (group.questions.length === 0) {
        alert(`Vui lòng thêm ít nhất 1 câu hỏi cho Nhóm ${j + 1} của Part ${i + 1}`)
        return
      }
    }
  }

  // TODO: Handle audio file upload if needed
  if (audioFile.value) {
    console.log('Need to upload audio file:', audioFile.value.name)
    // Simulate upload - in real implementation, upload file first and get ID
    // formData.value.audioFileId = uploadedFileId
  }

  emit('save', formData.value)
}
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>  
<style src="@/assets/buttons.css"></style>
<style src="./TestManagement.css" scoped></style>
<style scoped>
/* Component-specific styles */
.listening-part-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.part-info,
.group-info {
  background: #e2e8f0;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: normal;
}

.question-group-item {
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.group-header h6 {
  margin: 0;
  color: #4a5568;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.questions-subsection,
.question-groups-subsection {
  margin-top: 1rem;
}

.audio-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.audio-player {
  width: 100%;
  height: 40px;
}

.audio-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
}

.audio-actions {
  display: flex;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .group-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>
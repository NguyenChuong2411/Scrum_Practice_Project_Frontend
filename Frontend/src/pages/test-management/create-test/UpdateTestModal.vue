<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" :class="{ 'view-only-mode': viewOnly }" @click.stop>
      <div class="modal-header" :class="viewOnly ? 'info' : 'success'">
        <h3>
          <i :class="viewOnly ? 'fa-solid fa-eye' : 'fa-solid fa-edit'"></i>
          {{ viewOnly ? 'Xem chi tiết đề thi' : 'Chỉnh sửa đề thi' }}
        </h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fa-solid fa-circle-xmark"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <p>Đang tải dữ liệu đề thi...</p>
          </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="test-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h4 class="section-title">Thông tin cơ bản</h4>
            
            <div class="form-row">
              <div class="form-group">
                <label>ID đề thi</label>
                <input 
                  type="text" 
                  :value="formData.id" 
                  disabled
                  class="form-input disabled"
                />
              </div>
              <div class="form-group">
                <label>Ngày tạo</label>
                <input 
                  type="text" 
                  :value="formatDate(formData.createdAt)" 
                  disabled
                  class="form-input disabled"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tên đề thi *</label>
                <input 
                  type="text" 
                  v-model="formData.title" 
                  required 
                  placeholder="Nhập tên đề thi..."
                  class="form-input"
                  :disabled="viewOnly"
                  :class="{ 'disabled': viewOnly }"
                />
              </div>
              <div class="form-group">
                <label>Loại đề thi *</label>
                <select v-model="formData.testTypeId" required class="form-select" :disabled="viewOnly" :class="{ 'disabled': viewOnly }">
                  <option value="">Chọn loại đề thi</option>
                  <option :value="type.id" v-for="type in testTypes" :key="type.id">
                    {{ type.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Thời gian (phút) *</label>
                <input 
                  type="number" 
                  v-model="formData.durationMinutes" 
                  required 
                  min="1" 
                  placeholder="60"
                  class="form-input"
                  :disabled="viewOnly"
                  :class="{ 'disabled': viewOnly }"
                />
              </div>
              <div class="form-group">
                <label>File âm thanh (ID)</label>
                <input 
                  type="number" 
                  v-model="formData.audioFileId" 
                  placeholder="ID file âm thanh (nếu có)"
                  class="form-input"
                  :disabled="viewOnly"
                  :class="{ 'disabled': viewOnly }"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="formData.description" 
                placeholder="Mô tả chi tiết về đề thi..."
                rows="3"
                class="form-textarea"
                :disabled="viewOnly"
                :class="{ 'disabled': viewOnly }"
              ></textarea>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                Đoạn văn Reading
              </h4>
              <button v-if="!viewOnly" type="button" class="btn-add" @click="addPassage">
                <i class="fa-solid fa-plus"></i>
                Thêm đoạn văn
              </button>
            </div>

            <div v-if="formData.passages.length === 0" class="empty-state">
              <p>Chưa có đoạn văn nào. Click "Thêm đoạn văn" để bắt đầu.</p>
            </div>

            <div v-for="(passage, pIndex) in formData.passages" :key="'passage-' + pIndex" class="passage-item">
              <div class="item-header">
                <h5>
                  <i class="fa-solid fa-file-text"></i>
                  Đoạn văn {{ pIndex + 1 }}
                </h5>
                <button type="button" class="btn-remove" @click="removePassage(pIndex)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Tiêu đề đoạn văn</label>
                  <input 
                    type="text" 
                    v-model="passage.title" 
                    placeholder="Tiêu đề của đoạn văn..."
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input 
                    type="number" 
                    v-model="passage.displayOrder" 
                    min="1"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Nội dung đoạn văn</label>
                <textarea 
                  v-model="passage.content" 
                  placeholder="Nội dung đoạn văn..."
                  rows="4"
                  required
                  class="form-textarea"
                ></textarea>
              </div>

              <!-- Questions for this passage -->
              <div class="questions-subsection">
                <div class="subsection-header">
                  <h6>
                    Câu hỏi ({{ passage.questions.length }})
                  </h6>
                  <button type="button" class="btn-add small" @click="addQuestionToPassage(pIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm câu hỏi
                  </button>
                </div>

                <div v-if="passage.questions.length === 0" class="empty-state small">
                  <p>Chưa có câu hỏi nào</p>
                </div>

                <div v-for="(question, qIndex) in passage.questions" :key="'passage-question-' + qIndex" class="question-item">
                  <QuestionForm 
                    :question="question"
                    :question-number="qIndex + 1"
                    :show-id="true"
                    @update="updatePassageQuestion(pIndex, qIndex, $event)"
                    @remove="removePassageQuestion(pIndex, qIndex)"
                  />
                </div>

                <!-- Bottom Add Question Button -->
                <div v-if="passage.questions.length > 0" class="bottom-add-button">
                  <button type="button" class="btn-add" @click="addQuestionToPassage(pIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm câu hỏi
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Listening Parts Section -->
          <div class="form-section">
            <div class="section-header">
              <h4 class="section-title">
                <i class="fa-solid fa-headphones"></i>
                Listening Parts
              </h4>
              <button type="button" class="btn-add" @click="addListeningPart">
                <i class="fa-solid fa-plus"></i>
                Thêm Part
              </button>
            </div>

            <div v-if="formData.listeningParts.length === 0" class="empty-state">
              <i class="fa-solid fa-headphones"></i>
              <p>Chưa có Listening Part nào. Click "Thêm Part" để bắt đầu.</p>
            </div>

            <div v-for="(part, partIndex) in formData.listeningParts" :key="'part-' + partIndex" class="listening-part-item">
              <div class="item-header">
                <h5>
                  <i class="fa-solid fa-volume-up"></i>
                  Part {{ partIndex + 1 }}
                  <span v-if="part.id" class="id-badge">ID: {{ part.id }}</span>
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
                    placeholder="Tiêu đề của Part..."
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
                      <span v-if="group.id" class="id-badge">ID: {{ group.id }}</span>
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
                        :show-id="true"
                        @update="updateGroupQuestion(partIndex, groupIndex, qIndex, $event)"
                        @remove="removeGroupQuestion(partIndex, groupIndex, qIndex)"
                      />
                    </div>

                    <!-- Bottom Add Question Button -->
                    <div v-if="group.questions.length > 0" class="bottom-add-button">
                      <button type="button" class="btn-add" @click="addQuestionToGroup(partIndex, groupIndex)">
                        <i class="fa-solid fa-plus"></i>
                        Thêm câu hỏi
                      </button>
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
          {{ viewOnly ? 'Đóng' : 'Hủy bỏ' }}
        </button>
        <button v-if="!viewOnly" type="button" class="btn primary" @click="handleSubmit" :disabled="isSaving || isLoading">
          {{ isSaving ? 'Đang cập nhật...' : 'Cập nhật đề thi' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import QuestionForm from './QuestionFormNew.vue'
import { TestDataHelpers, TestAdminAPI } from '@/services/TestAdminAPI.js'

const props = defineProps({
  testTypes: {
    type: Array,
    default: () => []
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  testId: {
    type: [Number, String],
    required: true
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// State
const isLoading = ref(false)
const formData = ref(TestDataHelpers.createEmptyTest())

// Load test data
const loadTestData = async () => {
  if (!props.testId) return
  
  isLoading.value = true
  try {
    const testData = await TestAdminAPI.getTestById(props.testId)
    formData.value = { ...testData }
  } catch (error) {
    console.error('Error loading test data:', error)
    alert('Không thể tải dữ liệu đề thi: ' + error.message)
    emit('close')
  } finally {
    isLoading.value = false
  }
}

// Utility function
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Passage management
const addPassage = () => {
  const newPassage = TestDataHelpers.createEmptyPassage(formData.value.passages.length + 1)
  formData.value.passages.push(newPassage)
}

const removePassage = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa đoạn văn này không?')) {
    formData.value.passages.splice(index, 1)
    // Update display orders
    formData.value.passages.forEach((passage, i) => {
      passage.displayOrder = i + 1
    })
  }
}

const addQuestionToPassage = (passageIndex) => {
  const passage = formData.value.passages[passageIndex]
  const questionNumber = passage.questions.length + 1
  const newQuestion = TestDataHelpers.createEmptyQuestion(questionNumber)
  passage.questions.push(newQuestion)
}

const removePassageQuestion = (passageIndex, questionIndex) => {
  if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
    formData.value.passages[passageIndex].questions.splice(questionIndex, 1)
    // Update question numbers
    formData.value.passages[passageIndex].questions.forEach((question, i) => {
      question.questionNumber = i + 1
    })
  }
}

const updatePassageQuestion = (passageIndex, questionIndex, questionData) => {
  formData.value.passages[passageIndex].questions[questionIndex] = questionData
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

const handleSubmit = () => {
  emit('save', formData.value)
}

// Watch for testId changes
watch(() => props.testId, (newTestId) => {
  if (newTestId) {
    loadTestData()
  }
}, { immediate: true })

onMounted(() => {
  if (props.testId) {
    loadTestData()
  }
})
</script>

<style src="@/assets/modal.css"></style>
<style src="@/assets/form.css"></style>  
<style src="@/assets/buttons.css"></style>
<style src="../TestManagement.css" scoped></style>
<style scoped>
/* Component-specific styles */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  text-align: center;
  color: #F6871F;
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}

.loading-spinner p {
  margin: 0;
  font-weight: 500;
}

.id-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: normal;
  margin-left: 0.5rem;
}

.form-input.disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.passage-item,
.listening-part-item {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
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

/* Bottom Add Button */
.bottom-add-button {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px dashed #e2e8f0;
  display: flex;
  justify-content: center;
}

.bottom-add-button .btn-add {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
}

/* View-only mode styles */
.view-only-mode .btn-add,
.view-only-mode .btn-remove,
.view-only-mode .btn-remove-option {
  display: none !important;
}

.view-only-mode .form-input:disabled,
.view-only-mode .form-select:disabled,
.view-only-mode .form-textarea:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.view-only-mode .question-form {
  pointer-events: none;
}
</style>
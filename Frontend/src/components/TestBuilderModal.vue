<template>
  <div class="test-builder-modal">
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ isEdit ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới' }}</h3>
          <button class="close-btn" @click="$emit('close')">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Basic Information -->
          <div class="section">
            <h4 class="section-title">Thông tin cơ bản</h4>
            <div class="form-row">
              <div class="form-group">
                <label>Tên đề thi *</label>
                <input 
                  type="text" 
                  v-model="localTestData.title" 
                  required 
                  placeholder="Nhập tên đề thi..."
                />
              </div>
              <div class="form-group">
                <label>Loại đề thi *</label>
                <select v-model="localTestData.testTypeId" required>
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
                  v-model="localTestData.durationMinutes" 
                  required 
                  min="1" 
                  placeholder="60"
                />
              </div>
              <div class="form-group">
                <label>File âm thanh</label>
                <input 
                  type="number" 
                  v-model="localTestData.audioFileId" 
                  placeholder="ID file âm thanh (nếu có)"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="localTestData.description" 
                placeholder="Mô tả chi tiết về đề thi..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Reading Passages Section -->
          <div class="section">
            <div class="section-header">
              <h4 class="section-title">Đoạn văn Reading</h4>
              <button type="button" class="btn-add" @click="addPassage">
                <i class="fa-solid fa-plus"></i>
                Thêm đoạn văn
              </button>
            </div>

            <div v-for="(passage, pIndex) in localTestData.passages" :key="'passage-' + pIndex" class="passage-container">
              <div class="passage-header">
                <h5>Đoạn văn {{ pIndex + 1 }}</h5>
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
                  />
                </div>
                <div class="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input 
                    type="number" 
                    v-model="passage.displayOrder" 
                    min="1"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Nội dung đoạn văn *</label>
                <textarea 
                  v-model="passage.content" 
                  placeholder="Nội dung đoạn văn..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <!-- Questions for this passage -->
              <div class="questions-section">
                <div class="subsection-header">
                  <h6>Câu hỏi cho đoạn văn này</h6>
                  <button type="button" class="btn-add small" @click="addQuestionToPassage(pIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm câu hỏi
                  </button>
                </div>

                <div v-for="(question, qIndex) in passage.questions" :key="'passage-question-' + qIndex" class="question-container">
                  <QuestionBuilder 
                    :question="question"
                    :question-index="qIndex + 1"
                    @update="updatePassageQuestion(pIndex, qIndex, $event)"
                    @remove="removePassageQuestion(pIndex, qIndex)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Listening Parts Section -->
          <div class="section">
            <div class="section-header">
              <h4 class="section-title">Listening Parts</h4>
              <button type="button" class="btn-add" @click="addListeningPart">
                <i class="fa-solid fa-plus"></i>
                Thêm Part
              </button>
            </div>

            <div v-for="(part, partIndex) in localTestData.listeningParts" :key="'part-' + partIndex" class="listening-part-container">
              <div class="part-header">
                <h5>Part {{ partIndex + 1 }}</h5>
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
                  />
                </div>
                <div class="form-group">
                  <label>Tiêu đề Part</label>
                  <input 
                    type="text" 
                    v-model="part.title" 
                    placeholder="Tiêu đề của Part..."
                  />
                </div>
              </div>

              <!-- Question Groups for this part -->
              <div class="question-groups-section">
                <div class="subsection-header">
                  <h6>Nhóm câu hỏi</h6>
                  <button type="button" class="btn-add small" @click="addQuestionGroup(partIndex)">
                    <i class="fa-solid fa-plus"></i>
                    Thêm nhóm
                  </button>
                </div>

                <div v-for="(group, groupIndex) in part.questionGroups" :key="'group-' + groupIndex" class="question-group-container">
                  <div class="group-header">
                    <h6>Nhóm {{ groupIndex + 1 }}</h6>
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
                      ></textarea>
                    </div>
                    <div class="form-group">
                      <label>Thứ tự hiển thị</label>
                      <input 
                        type="number" 
                        v-model="group.displayOrder" 
                        min="1"
                      />
                    </div>
                  </div>

                  <!-- Questions for this group -->
                  <div class="questions-section">
                    <div class="subsection-header">
                      <h6>Câu hỏi trong nhóm</h6>
                      <button type="button" class="btn-add small" @click="addQuestionToGroup(partIndex, groupIndex)">
                        <i class="fa-solid fa-plus"></i>
                        Thêm câu hỏi
                      </button>
                    </div>

                    <div v-for="(question, qIndex) in group.questions" :key="'group-question-' + qIndex" class="question-container">
                      <QuestionBuilder 
                        :question="question"
                        :question-index="qIndex + 1"
                        @update="updateGroupQuestion(partIndex, groupIndex, qIndex, $event)"
                        @remove="removeGroupQuestion(partIndex, groupIndex, qIndex)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn secondary" @click="$emit('close')">
            Hủy bỏ
          </button>
          <button type="button" class="btn primary" @click="saveTest" :disabled="isSaving">
            <i v-if="isSaving" class="fa-solid fa-spinner fa-spin"></i>
            {{ isSaving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo đề thi') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import QuestionBuilder from './QuestionBuilder.vue'
import { TestDataHelpers } from '@/services/TestAdminAPI.js'

const props = defineProps({
  testData: {
    type: Object,
    required: true
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  testTypes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

// Local copy of test data
const localTestData = ref({ ...props.testData })

// Watch for changes in props
watch(() => props.testData, (newData) => {
  localTestData.value = { ...newData }
}, { deep: true })

// Passage management
const addPassage = () => {
  const newPassage = TestDataHelpers.createEmptyPassage(localTestData.value.passages.length + 1)
  localTestData.value.passages.push(newPassage)
}

const removePassage = (index) => {
  localTestData.value.passages.splice(index, 1)
  // Update display orders
  localTestData.value.passages.forEach((passage, i) => {
    passage.displayOrder = i + 1
  })
}

const addQuestionToPassage = (passageIndex) => {
  const passage = localTestData.value.passages[passageIndex]
  const questionNumber = passage.questions.length + 1
  const newQuestion = TestDataHelpers.createEmptyQuestion(questionNumber)
  passage.questions.push(newQuestion)
}

const removePassageQuestion = (passageIndex, questionIndex) => {
  localTestData.value.passages[passageIndex].questions.splice(questionIndex, 1)
  // Update question numbers
  localTestData.value.passages[passageIndex].questions.forEach((question, i) => {
    question.questionNumber = i + 1
  })
}

const updatePassageQuestion = (passageIndex, questionIndex, questionData) => {
  localTestData.value.passages[passageIndex].questions[questionIndex] = questionData
}

// Listening part management
const addListeningPart = () => {
  const newPart = TestDataHelpers.createEmptyListeningPart(localTestData.value.listeningParts.length + 1)
  localTestData.value.listeningParts.push(newPart)
}

const removeListeningPart = (index) => {
  localTestData.value.listeningParts.splice(index, 1)
  // Update part numbers
  localTestData.value.listeningParts.forEach((part, i) => {
    part.partNumber = i + 1
  })
}

const addQuestionGroup = (partIndex) => {
  const part = localTestData.value.listeningParts[partIndex]
  const newGroup = TestDataHelpers.createEmptyQuestionGroup(part.questionGroups.length + 1)
  part.questionGroups.push(newGroup)
}

const removeQuestionGroup = (partIndex, groupIndex) => {
  localTestData.value.listeningParts[partIndex].questionGroups.splice(groupIndex, 1)
  // Update display orders
  localTestData.value.listeningParts[partIndex].questionGroups.forEach((group, i) => {
    group.displayOrder = i + 1
  })
}

const addQuestionToGroup = (partIndex, groupIndex) => {
  const group = localTestData.value.listeningParts[partIndex].questionGroups[groupIndex]
  const questionNumber = group.questions.length + 1
  const newQuestion = TestDataHelpers.createEmptyQuestion(questionNumber)
  group.questions.push(newQuestion)
}

const removeGroupQuestion = (partIndex, groupIndex, questionIndex) => {
  localTestData.value.listeningParts[partIndex].questionGroups[groupIndex].questions.splice(questionIndex, 1)
  // Update question numbers
  localTestData.value.listeningParts[partIndex].questionGroups[groupIndex].questions.forEach((question, i) => {
    question.questionNumber = i + 1
  })
}

const updateGroupQuestion = (partIndex, groupIndex, questionIndex, questionData) => {
  localTestData.value.listeningParts[partIndex].questionGroups[groupIndex].questions[questionIndex] = questionData
}

const saveTest = () => {
  emit('save', localTestData.value)
}
</script>

<style scoped>
.test-builder-modal .modal-content.large {
  max-width: 1200px;
  width: 95%;
  max-height: 95vh;
}

.modal-body {
  padding: 0 2rem 2rem;
  max-height: calc(95vh - 120px);
  overflow-y: auto;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.section-title {
  margin: 0 0 1rem 0;
  color: #1a202c;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.subsection-header h6 {
  margin: 0;
  color: #4a5568;
  font-size: 1rem;
  font-weight: 500;
}

.passage-container,
.listening-part-container {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.passage-header,
.part-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.passage-header h5,
.part-header h5 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
}

.question-group-container {
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
}

.questions-section {
  margin-top: 1rem;
}

.question-container {
  margin-bottom: 1rem;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-add:hover {
  background: #38a169;
}

.btn-add.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-remove:hover {
  background: #e53e3e;
}

.btn-remove.small {
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #F6871F;
  box-shadow: 0 0 0 3px rgba(246, 135, 31, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: white;
  position: sticky;
  bottom: 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  background: #F6871F;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #e67e22;
}

.btn.secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn.secondary:hover {
  background: #d1d5db;
}

/* Responsive */
@media (max-width: 768px) {
  .test-builder-modal .modal-content.large {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .section-header,
  .subsection-header,
  .passage-header,
  .part-header,
  .group-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>
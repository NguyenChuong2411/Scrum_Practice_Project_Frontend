<template>
  <div class="question-form">
    <div class="question-header">
      <h6>
        <i class="fa-solid fa-question-circle"></i>
        Câu hỏi {{ questionNumber }}
        <span v-if="showId && question.id" class="id-badge">ID: {{ question.id }}</span>
      </h6>
      <button type="button" class="btn-remove small" @click="$emit('remove')">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <div class="question-content">
      <!-- Question Basic Info -->
      <div class="form-row">
        <div class="form-group">
          <label>Số câu hỏi</label>
          <input 
            type="number" 
            v-model="localQuestion.questionNumber" 
            min="1"
            class="form-input"
            @input="updateQuestion"
          />
        </div>
        <div class="form-group">
          <label>Loại câu hỏi</label>
          <select 
            v-model="localQuestion.questionType" 
            class="form-select"
            @change="updateQuestion"
          >
            <option value="MultipleChoice">Trắc nghiệm</option>
            <option value="FillInTheBlank">Điền từ</option>
            <option value="TrueFalse">Đúng/Sai</option>
            <option value="Matching">Matching</option>
            <option value="Ordering">Sắp xếp</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Điểm số</label>
          <input 
            type="number" 
            v-model="localQuestion.points" 
            min="0" 
            step="0.5"
            class="form-input"
            @input="updateQuestion"
          />
        </div>
        <div class="form-group">
          <label>Thời gian (giây)</label>
          <input 
            type="number" 
            v-model="localQuestion.timeLimit" 
            min="0"
            class="form-input"
            @input="updateQuestion"
          />
        </div>
      </div>

      <!-- Question Text -->
      <div class="form-group">
        <label>Nội dung câu hỏi *</label>
        <textarea 
          v-model="localQuestion.questionText" 
          placeholder="Nhập nội dung câu hỏi..."
          rows="3"
          required
          class="form-textarea"
          @input="updateQuestion"
        ></textarea>
      </div>

      <!-- Explanation -->
      <div class="form-group">
        <label>Giải thích đáp án</label>
        <textarea 
          v-model="localQuestion.explanation" 
          placeholder="Giải thích tại sao đáp án này đúng..."
          rows="2"
          class="form-textarea"
          @input="updateQuestion"
        ></textarea>
      </div>

      <!-- Answer Options -->
      <div class="answer-options-section">
        <div class="options-header">
          <h6>
            <i class="fa-solid fa-list"></i>
            Các lựa chọn ({{ localQuestion.answerOptions.length }})
          </h6>
          <button type="button" class="btn-add small" @click="addAnswerOption">
            <i class="fa-solid fa-plus"></i>
            Thêm lựa chọn
          </button>
        </div>

        <div v-if="localQuestion.answerOptions.length === 0" class="empty-state small">
          <i class="fa-solid fa-list"></i>
          <p>Chưa có lựa chọn nào</p>
        </div>

        <div class="answer-options-list">
          <div v-for="(option, index) in localQuestion.answerOptions" :key="'option-' + index" class="answer-option">
            <div class="option-header">
              <label class="option-label">
                <input 
                  type="radio" 
                  :name="'correct-' + questionNumber" 
                  :checked="option.isCorrect"
                  @change="setCorrectAnswer(index)"
                  class="option-radio"
                />
                <span class="option-title">
                  Lựa chọn {{ String.fromCharCode(65 + index) }}
                  <span v-if="showId && option.id" class="id-badge small">ID: {{ option.id }}</span>
                </span>
              </label>
              <button type="button" class="btn-remove small" @click="removeAnswerOption(index)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Nội dung lựa chọn *</label>
                <textarea 
                  v-model="option.optionText" 
                  placeholder="Nhập nội dung lựa chọn..."
                  rows="2"
                  required
                  class="form-textarea"
                  @input="updateQuestion"
                ></textarea>
              </div>
              <div class="form-group">
                <label>Giải thích lựa chọn</label>
                <textarea 
                  v-model="option.explanation" 
                  placeholder="Giải thích cho lựa chọn này..."
                  rows="2"
                  class="form-textarea"
                  @input="updateQuestion"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  questionNumber: {
    type: Number,
    required: true
  },
  showId: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'remove'])

// Local copy of question data
const localQuestion = ref({ ...props.question })

// Helper function to create empty answer option
const createEmptyAnswerOption = () => ({
  id: null,
  optionText: '',
  isCorrect: false,
  explanation: '',
  displayOrder: 1
})

// Add new answer option
const addAnswerOption = () => {
  const newOption = createEmptyAnswerOption()
  newOption.displayOrder = localQuestion.value.answerOptions.length + 1
  localQuestion.value.answerOptions.push(newOption)
  updateQuestion()
}

// Remove answer option
const removeAnswerOption = (index) => {
  if (localQuestion.value.answerOptions.length <= 1) {
    alert('Câu hỏi phải có ít nhất 1 lựa chọn!')
    return
  }
  
  localQuestion.value.answerOptions.splice(index, 1)
  
  // Update display orders
  localQuestion.value.answerOptions.forEach((option, i) => {
    option.displayOrder = i + 1
  })
  
  updateQuestion()
}

// Set correct answer
const setCorrectAnswer = (index) => {
  localQuestion.value.answerOptions.forEach((option, i) => {
    option.isCorrect = (i === index)
  })
  updateQuestion()
}

// Update question data
const updateQuestion = () => {
  emit('update', { ...localQuestion.value })
}

// Watch for prop changes
watch(() => props.question, (newQuestion) => {
  localQuestion.value = { ...newQuestion }
}, { deep: true })

// Initialize with at least 2 options if empty
onMounted(() => {
  if (localQuestion.value.answerOptions.length === 0) {
    addAnswerOption()
    addAnswerOption()
  }
})
</script>

<style src="@/assets/form.css"></style>
<style src="@/assets/buttons.css"></style>
<style src="./TestManagement.css" scoped></style>
<style scoped>
/* Component-specific styles */
.question-form {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.question-header h6 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.id-badge {
  background: #e2e8f0;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: normal;
}

.id-badge.small {
  padding: 0.0625rem 0.375rem;
  font-size: 0.625rem;
}

.answer-options-section {
  margin-top: 1rem;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.options-header h6 {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.answer-option {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #2d3748;
}

.option-radio {
  width: 16px;
  height: 16px;
  accent-color: #F6871F;
}

.option-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .question-header,
  .options-header,
  .option-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>
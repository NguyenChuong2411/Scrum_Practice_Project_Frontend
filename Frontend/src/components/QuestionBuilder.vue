<template>
  <div class="question-builder">
    <div class="question-header">
      <h6>Câu hỏi {{ questionIndex }}</h6>
      <button type="button" class="btn-remove small" @click="$emit('remove')">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Số thứ tự</label>
        <input 
          type="number" 
          v-model="localQuestion.questionNumber" 
          min="1"
          @input="updateQuestion"
        />
      </div>
      <div class="form-group">
        <label>Loại câu hỏi</label>
        <select v-model="localQuestion.questionType" @change="updateQuestion">
          <option value="single-choice">Trắc nghiệm một đáp án</option>
          <option value="multiple-choice">Trắc nghiệm nhiều đáp án</option>
          <option value="fill-in-blank">Điền vào chỗ trống</option>
          <option value="true-false">Đúng/Sai</option>
          <option value="matching">Nối câu</option>
          <option value="table">Bảng</option>
          <option value="table-child">Câu hỏi con trong bảng</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Câu hỏi *</label>
      <textarea 
        v-model="localQuestion.prompt" 
        placeholder="Nhập nội dung câu hỏi..."
        rows="2"
        required
        @input="updateQuestion"
      ></textarea>
    </div>

    <div class="form-group" v-if="localQuestion.questionType === 'table'">
      <label>Dữ liệu bảng (JSON)</label>
      <textarea 
        v-model="localQuestion.tableData" 
        placeholder='{"headers": ["Cột 1", "Cột 2"], "rows": [["A", "B"], ["C", "D"]]}'
        rows="3"
        @input="updateQuestion"
      ></textarea>
    </div>

    <div class="form-group">
      <label>Đáp án đúng *</label>
      <input 
        type="text" 
        v-model="localQuestion.correctAnswers" 
        placeholder="Nhập đáp án đúng (có thể nhiều đáp án, cách nhau bởi dấu ;)"
        required
        @input="updateQuestion"
      />
    </div>

    <!-- Options for multiple choice questions -->
    <div v-if="['single-choice', 'multiple-choice', 'true-false'].includes(localQuestion.questionType)" class="options-section">
      <div class="subsection-header">
        <h6>Các lựa chọn</h6>
        <button type="button" class="btn-add small" @click="addOption">
          <i class="fa-solid fa-plus"></i>
          Thêm lựa chọn
        </button>
      </div>

      <div v-for="(option, oIndex) in localQuestion.options" :key="'option-' + oIndex" class="option-container">
        <div class="option-row">
          <div class="form-group">
            <label>Nhãn</label>
            <input 
              type="text" 
              v-model="option.optionLabel" 
              placeholder="A"
              maxlength="5"
              @input="updateQuestion"
            />
          </div>
          <div class="form-group flex-grow">
            <label>Nội dung lựa chọn</label>
            <input 
              type="text" 
              v-model="option.optionText" 
              placeholder="Nội dung lựa chọn..."
              @input="updateQuestion"
            />
          </div>
          <div class="form-group">
            <label>Thứ tự</label>
            <input 
              type="number" 
              v-model="option.displayOrder" 
              min="1"
              @input="updateQuestion"
            />
          </div>
          <div class="option-actions">
            <button type="button" class="btn-remove small" @click="removeOption(oIndex)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pre-defined options for True/False -->
    <div v-if="localQuestion.questionType === 'true-false' && localQuestion.options.length === 0" class="auto-options">
      <button type="button" class="btn secondary small" @click="addTrueFalseOptions">
        Thêm lựa chọn Đúng/Sai tự động
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { TestDataHelpers } from '@/services/TestAdminAPI.js'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  questionIndex: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update', 'remove'])

const localQuestion = ref({ ...props.question })

// Watch for external changes
watch(() => props.question, (newQuestion) => {
  localQuestion.value = { ...newQuestion }
}, { deep: true })

// Ensure options array exists
onMounted(() => {
  if (!localQuestion.value.options) {
    localQuestion.value.options = []
  }
})

const updateQuestion = () => {
  emit('update', { ...localQuestion.value })
}

// Option management
const addOption = () => {
  if (!localQuestion.value.options) {
    localQuestion.value.options = []
  }
  
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const nextLabel = optionLabels[localQuestion.value.options.length] || String.fromCharCode(65 + localQuestion.value.options.length)
  
  const newOption = TestDataHelpers.createEmptyOption(
    localQuestion.value.options.length + 1,
    nextLabel
  )
  
  localQuestion.value.options.push(newOption)
  updateQuestion()
}

const removeOption = (index) => {
  localQuestion.value.options.splice(index, 1)
  // Update display orders
  localQuestion.value.options.forEach((option, i) => {
    option.displayOrder = i + 1
  })
  updateQuestion()
}

const addTrueFalseOptions = () => {
  localQuestion.value.options = [
    {
      optionLabel: 'T',
      optionText: 'Đúng',
      displayOrder: 1
    },
    {
      optionLabel: 'F',
      optionText: 'Sai',
      displayOrder: 2
    }
  ]
  updateQuestion()
}

// Auto-generate options based on question type
watch(() => localQuestion.value.questionType, (newType) => {
  if (newType === 'true-false' && localQuestion.value.options.length === 0) {
    // Don't auto-add, let user click the button
  } else if (newType === 'single-choice' && localQuestion.value.options.length === 0) {
    // Add default 4 options for single choice
    for (let i = 0; i < 4; i++) {
      addOption()
    }
  }
  updateQuestion()
})
</script>

<style scoped>
.question-builder {
  background: white;
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

.form-group.flex-grow {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #F6871F;
  box-shadow: 0 0 0 2px rgba(246, 135, 31, 0.1);
}

.options-section {
  margin-top: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.375rem;
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
  font-size: 0.875rem;
  font-weight: 500;
}

.option-container {
  margin-bottom: 0.75rem;
}

.option-row {
  display: grid;
  grid-template-columns: 80px 1fr 100px 40px;
  gap: 0.75rem;
  align-items: end;
}

.option-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
}

.auto-options {
  text-align: center;
  margin-top: 1rem;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-add:hover {
  background: #38a169;
}

.btn-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.75rem;
}

.btn-remove:hover {
  background: #e53e3e;
}

.btn.secondary {
  background: #e2e8f0;
  color: #4a5568;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
}

.btn.secondary:hover {
  background: #cbd5e0;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .option-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .option-actions {
    height: auto;
    justify-content: flex-start;
  }
}
</style>
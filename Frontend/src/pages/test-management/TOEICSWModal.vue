<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header purple">
        <h3>
          <i class="fa-solid fa-microphone"></i>
          Tạo đề thi TOEIC Speaking & Writing
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
                  placeholder="VD: TOEIC Speaking & Writing Practice Test 1"
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
                  placeholder="80"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="formData.description" 
                placeholder="Mô tả chi tiết về đề thi TOEIC Speaking & Writing..."
                rows="3"
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- Speaking Section -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fa-solid fa-microphone"></i>
              TOEIC Speaking Template
            </h4>
            
            <div class="form-group">
              <label>Hướng dẫn chung cho phần Speaking *</label>
              <textarea 
                v-model="formData.speakingInstructions" 
                required
                placeholder="Nhập hướng dẫn chung cho thí sinh làm phần Speaking (cách thức làm bài, thời gian, yêu cầu...)&#10;&#10;VD: 
- Phần Speaking gồm 11 câu hỏi, chia thành 6 dạng
- Thời gian làm bài: 20 phút
- Thí sinh cần nói vào microphone theo hướng dẫn
- Mỗi câu hỏi có thời gian chuẩn bị và trả lời riêng"
                rows="6"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Template câu hỏi Speaking *</label>
              <textarea 
                v-model="formData.speakingTemplate" 
                required
                placeholder="Nhập template đầy đủ cho đề thi Speaking...&#10;&#10;VD:
Questions 1-2: Read a text aloud
- Question 1: [Đoạn văn bản 1]
- Question 2: [Đoạn văn bản 2]

Question 3: Describe a picture
- [Mô tả hình ảnh cần miêu tả]

Questions 4-6: Respond to questions
- Question 4: [Câu hỏi 1]
- Question 5: [Câu hỏi 2] 
- Question 6: [Câu hỏi 3]

Questions 7-9: Respond to questions using information provided
- [Thông tin cần thiết]
- Question 7: [Câu hỏi 1]
- Question 8: [Câu hỏi 2]
- Question 9: [Câu hỏi 3]

Question 10: Propose a solution
- [Tình huống cần giải quyết]

Question 11: Express an opinion
- [Chủ đề cần bày tỏ ý kiến]"
                rows="20"
                class="form-textarea"
              ></textarea>
              <div class="word-count">
                Số từ: {{ getWordCount(formData.speakingTemplate) }}
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Thời gian Speaking (phút)</label>
                <input 
                  type="number" 
                  v-model="formData.speakingDuration" 
                  min="1" 
                  placeholder="20"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Số câu hỏi Speaking</label>
                <input 
                  type="number" 
                  v-model="formData.speakingQuestionCount" 
                  min="1" 
                  placeholder="11"
                  class="form-input"
                />
              </div>
            </div>

            <!-- Speaking Scoring Criteria -->
            <div class="scoring-section">
              <h5 class="subsection-title">
                <i class="fa-solid fa-star"></i>
                Tiêu chí chấm điểm Speaking
              </h5>
              
              <div class="form-group">
                <label>Pronunciation (Phát âm)</label>
                <textarea 
                  v-model="formData.speakingScoring.pronunciation" 
                  placeholder="Tiêu chí đánh giá phát âm (0-3 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Intonation and Stress (Ngữ điệu và trọng âm)</label>
                <textarea 
                  v-model="formData.speakingScoring.intonation" 
                  placeholder="Tiêu chí đánh giá ngữ điệu và trọng âm (0-3 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Grammar (Ngữ pháp)</label>
                <textarea 
                  v-model="formData.speakingScoring.grammar" 
                  placeholder="Tiêu chí đánh giá ngữ pháp (0-3 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Vocabulary (Từ vựng)</label>
                <textarea 
                  v-model="formData.speakingScoring.vocabulary" 
                  placeholder="Tiêu chí đánh giá từ vựng (0-3 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Coherence (Sự mạch lạc)</label>
                <textarea 
                  v-model="formData.speakingScoring.coherence" 
                  placeholder="Tiêu chí đánh giá sự mạch lạc (0-3 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Relevance and Completeness (Tính phù hợp và đầy đủ)</label>
                <textarea 
                  v-model="formData.speakingScoring.relevance" 
                  placeholder="Tiêu chí đánh giá tính phù hợp và đầy đủ (0-3 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Writing Section -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fa-solid fa-pen"></i>
              TOEIC Writing Template
            </h4>
            
            <div class="form-group">
              <label>Hướng dẫn chung cho phần Writing *</label>
              <textarea 
                v-model="formData.writingInstructions" 
                required
                placeholder="Nhập hướng dẫn chung cho thí sinh làm phần Writing (cách thức làm bài, thời gian, yêu cầu...)&#10;&#10;VD:
- Phần Writing gồm 8 câu hỏi, chia thành 3 dạng
- Thời gian làm bài: 60 phút
- Thí sinh cần gõ câu trả lời vào máy tính
- Cần chú ý về ngữ pháp, từ vựng và cấu trúc câu"
                rows="6"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Template câu hỏi Writing *</label>
              <textarea 
                v-model="formData.writingTemplate" 
                required
                placeholder="Nhập template đầy đủ cho đề thi Writing...&#10;&#10;VD:
Questions 1-5: Write a sentence based on a picture
- Picture 1: [Mô tả hình ảnh 1]
- Picture 2: [Mô tả hình ảnh 2]
- Picture 3: [Mô tả hình ảnh 3]
- Picture 4: [Mô tả hình ảnh 4]
- Picture 5: [Mô tả hình ảnh 5]

Questions 6-7: Respond to a written request
- Request 1: [Email/thông tin yêu cầu 1]
- Request 2: [Email/thông tin yêu cầu 2]

Question 8: Write an opinion essay
- Topic: [Chủ đề cần viết essay]
- Requirements: Write 300 words expressing your opinion about..."
                rows="18"
                class="form-textarea"
              ></textarea>
              <div class="word-count">
                Số từ: {{ getWordCount(formData.writingTemplate) }}
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Thời gian Writing (phút)</label>
                <input 
                  type="number" 
                  v-model="formData.writingDuration" 
                  min="1" 
                  placeholder="60"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Số câu hỏi Writing</label>
                <input 
                  type="number" 
                  v-model="formData.writingQuestionCount" 
                  min="1" 
                  placeholder="8"
                  class="form-input"
                />
              </div>
            </div>

            <!-- Writing Scoring Criteria -->
            <div class="scoring-section">
              <h5 class="subsection-title">
                <i class="fa-solid fa-star"></i>
                Tiêu chí chấm điểm Writing
              </h5>
              
              <div class="form-group">
                <label>Grammar (Ngữ pháp)</label>
                <textarea 
                  v-model="formData.writingScoring.grammar" 
                  placeholder="Tiêu chí đánh giá ngữ pháp (0-5 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Vocabulary (Từ vựng)</label>
                <textarea 
                  v-model="formData.writingScoring.vocabulary" 
                  placeholder="Tiêu chí đánh giá từ vựng (0-5 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Organization (Tổ chức bài viết)</label>
                <textarea 
                  v-model="formData.writingScoring.organization" 
                  placeholder="Tiêu chí đánh giá tổ chức bài viết (0-5 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Quality and Variety of Sentences (Chất lượng và đa dạng câu)</label>
                <textarea 
                  v-model="formData.writingScoring.sentenceQuality" 
                  placeholder="Tiêu chí đánh giá chất lượng và đa dạng câu (0-5 điểm)..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Opinion Development and Support (Phát triển và hỗ trợ ý kiến)</label>
                <textarea 
                  v-model="formData.writingScoring.opinionDevelopment" 
                  placeholder="Tiêu chí đánh giá phát triển và hỗ trợ ý kiến (0-5 điểm) - chỉ áp dụng cho Question 8..."
                  rows="2"
                  class="form-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div class="form-section">
            <h4 class="section-title">
              <i class="fa-solid fa-sticky-note"></i>
              Ghi chú bổ sung
            </h4>
            
            <div class="form-group">
              <label>Ghi chú cho giám khảo</label>
              <textarea 
                v-model="formData.examinerNotes" 
                placeholder="Ghi chú bổ sung cho giám khảo về cách chấm điểm, lưu ý đặc biệt..."
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Điểm tối đa Speaking</label>
                <input 
                  type="number" 
                  v-model="formData.maxSpeakingScore" 
                  min="1" 
                  placeholder="200"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Điểm tối đa Writing</label>
                <input 
                  type="number" 
                  v-model="formData.maxWritingScore" 
                  min="1" 
                  placeholder="200"
                  class="form-input"
                />
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
          {{ isSaving ? 'Đang tạo...' : 'Tạo đề thi TOEIC SW' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
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
  durationMinutes: 80,
  testTypeId: props.testTypeId,
  
  // Speaking section
  speakingInstructions: '',
  speakingTemplate: '',
  speakingDuration: 20,
  speakingQuestionCount: 11,
  speakingScoring: {
    pronunciation: '',
    intonation: '',
    grammar: '',
    vocabulary: '',
    coherence: '',
    relevance: ''
  },
  
  // Writing section
  writingInstructions: '',
  writingTemplate: '',
  writingDuration: 60,
  writingQuestionCount: 8,
  writingScoring: {
    grammar: '',
    vocabulary: '',
    organization: '',
    sentenceQuality: '',
    opinionDevelopment: ''
  },
  
  // Additional
  examinerNotes: '',
  maxSpeakingScore: 200,
  maxWritingScore: 200
})

// Utility functions
const getWordCount = (text) => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const handleSubmit = () => {
  // Basic validation
  if (!formData.value.title.trim()) {
    alert('Vui lòng nhập tên đề thi')
    return
  }

  if (!formData.value.speakingInstructions.trim()) {
    alert('Vui lòng nhập hướng dẫn cho phần Speaking')
    return
  }

  if (!formData.value.speakingTemplate.trim()) {
    alert('Vui lòng nhập template cho phần Speaking')
    return
  }

  if (!formData.value.writingInstructions.trim()) {
    alert('Vui lòng nhập hướng dẫn cho phần Writing')
    return
  }

  if (!formData.value.writingTemplate.trim()) {
    alert('Vui lòng nhập template cho phần Writing')
    return
  }

  // Additional validations
  if (formData.value.durationMinutes < 1) {
    alert('Thời gian làm bài phải lớn hơn 0')
    return
  }

  if (formData.value.speakingDuration < 1) {
    alert('Thời gian Speaking phải lớn hơn 0')
    return
  }

  if (formData.value.writingDuration < 1) {
    alert('Thời gian Writing phải lớn hơn 0')
    return
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
.subsection-title {
  margin: 1rem 0 0.75rem 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.scoring-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
}

.word-count {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}
</style>
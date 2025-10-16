import axios from 'axios'

// Cấu hình axios instance cho Online Test Service
const apiClient = axios.create({
  baseURL: 'https://localhost:7088/api/onlineTest/TestAdmin',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 // 30 seconds timeout
})

// Request interceptor để thêm token nếu cần
apiClient.interceptors.request.use(
  (config) => {
    // Thêm token nếu có
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor để xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data)
      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request)
    } else {
      // Something else happened
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export const TestAdminAPI = {
  // Lấy danh sách tất cả test cho admin
  async getAllTestsForAdmin() {
    try {
      const response = await apiClient.get('/GetAllTestsForAdmin')
      return response.data
    } catch (error) {
      throw new Error('Không thể tải danh sách đề thi: ' + error.message)
    }
  },

  // Lấy chi tiết test theo ID để sửa
  async getTestById(testId) {
    try {
      const response = await apiClient.get(`/GetTestById/${testId}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy đề thi')
      }
      throw new Error('Không thể tải chi tiết đề thi: ' + error.message)
    }
  },

  // Tạo test mới
  async createTest(testData) {
    try {
      const response = await apiClient.post('/CreateTest', testData)
      return response.data
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Dữ liệu không hợp lệ: ' + JSON.stringify(error.response.data))
      }
      throw new Error('Không thể tạo đề thi mới: ' + error.message)
    }
  },

  // Cập nhật test
  async updateTest(testId, testData) {
    try {
      const response = await apiClient.put(`/UpdateTest/${testId}`, testData)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy đề thi cần cập nhật')
      }
      if (error.response?.status === 400) {
        throw new Error('Dữ liệu không hợp lệ: ' + JSON.stringify(error.response.data))
      }
      throw new Error('Không thể cập nhật đề thi: ' + error.message)
    }
  },

  // Xóa test
  async deleteTest(testId) {
    try {
      const response = await apiClient.delete(`/DeleteTest/${testId}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy đề thi cần xóa')
      }
      throw new Error('Không thể xóa đề thi: ' + error.message)
    }
  }
}

// Helper functions để format dữ liệu
export const TestDataHelpers = {
  // Tạo cấu trúc test rỗng
  createEmptyTest() {
    return {
      title: '',
      description: '',
      durationMinutes: 60,
      testTypeId: 1, // Default to first test type
      audioFileId: null,
      passages: [],
      listeningParts: []
    }
  },

  // Tạo passage rỗng
  createEmptyPassage(displayOrder = 1) {
    return {
      title: '',
      content: '',
      displayOrder: displayOrder,
      questions: []
    }
  },

  // Tạo listening part rỗng
  createEmptyListeningPart(partNumber = 1) {
    return {
      partNumber: partNumber,
      title: '',
      questionGroups: []
    }
  },

  // Tạo question group rỗng
  createEmptyQuestionGroup(displayOrder = 1) {
    return {
      instructionText: '',
      displayOrder: displayOrder,
      questions: []
    }
  },

  // Tạo question rỗng
  createEmptyQuestion(questionNumber = 1, questionType = 'single-choice') {
    return {
      questionNumber: questionNumber,
      questionType: questionType,
      prompt: '',
      tableData: null,
      correctAnswers: '',
      options: []
    }
  },

  // Tạo option rỗng
  createEmptyOption(displayOrder = 1, optionLabel = 'A') {
    return {
      optionLabel: optionLabel,
      optionText: '',
      displayOrder: displayOrder
    }
  },

  // Validate test data trước khi gửi
  validateTestData(testData) {
    const errors = []

    if (!testData.title?.trim()) {
      errors.push('Tên đề thi không được để trống')
    }

    if (!testData.durationMinutes || testData.durationMinutes <= 0) {
      errors.push('Thời gian làm bài phải lớn hơn 0')
    }

    if (!testData.testTypeId) {
      errors.push('Phải chọn loại đề thi')
    }

    // Validate passages
    testData.passages?.forEach((passage, pIndex) => {
      if (!passage.title?.trim()) {
        errors.push(`Đoạn văn ${pIndex + 1}: Tiêu đề không được để trống`)
      }
      if (!passage.content?.trim()) {
        errors.push(`Đoạn văn ${pIndex + 1}: Nội dung không được để trống`)
      }

      passage.questions?.forEach((question, qIndex) => {
        if (!question.prompt?.trim()) {
          errors.push(`Đoạn văn ${pIndex + 1}, Câu hỏi ${qIndex + 1}: Câu hỏi không được để trống`)
        }
        if (!question.correctAnswers?.trim()) {
          errors.push(`Đoạn văn ${pIndex + 1}, Câu hỏi ${qIndex + 1}: Đáp án đúng không được để trống`)
        }
      })
    })

    // Validate listening parts
    testData.listeningParts?.forEach((part, pIndex) => {
      if (!part.title?.trim()) {
        errors.push(`Listening Part ${pIndex + 1}: Tiêu đề không được để trống`)
      }

      part.questionGroups?.forEach((group, gIndex) => {
        group.questions?.forEach((question, qIndex) => {
          if (!question.prompt?.trim()) {
            errors.push(`Listening Part ${pIndex + 1}, Nhóm ${gIndex + 1}, Câu hỏi ${qIndex + 1}: Câu hỏi không được để trống`)
          }
          if (!question.correctAnswers?.trim()) {
            errors.push(`Listening Part ${pIndex + 1}, Nhóm ${gIndex + 1}, Câu hỏi ${qIndex + 1}: Đáp án đúng không được để trống`)
          }
        })
      })
    })

    return errors
  }
}

export default TestAdminAPI
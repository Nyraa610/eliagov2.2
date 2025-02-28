
import { courseService } from "./courseService";
import { moduleService } from "./moduleService";
import { contentService } from "./contentService";
import { quizService } from "./quizService";
import { certificateService } from "./certificateService";
import { storageService } from "./storageService";

export const trainingService = {
  // Course related functions
  getCourses: courseService.getCourses,
  getCourseById: courseService.getCourseById,
  enrollUserInCourse: courseService.enrollUserInCourse,
  getUserEnrollments: courseService.getUserEnrollments,
  getEnrollmentByCourseId: courseService.getEnrollmentByCourseId,
  
  // Module related functions
  getModulesByCourseId: moduleService.getModulesByCourseId,
  markModuleAsCompleted: moduleService.markModuleAsCompleted,
  getCompletedModules: moduleService.getCompletedModules,
  
  // Content related functions
  getContentItemsByModuleId: contentService.getContentItemsByModuleId,
  
  // Quiz related functions
  getQuizQuestionsByContentItemId: quizService.getQuizQuestionsByContentItemId,
  getQuizAnswersByQuestionId: quizService.getQuizAnswersByQuestionId,
  saveQuizQuestion: quizService.saveQuizQuestion,
  updateQuizQuestion: quizService.updateQuizQuestion,
  deleteQuizQuestion: quizService.deleteQuizQuestion,
  saveQuizAnswer: quizService.saveQuizAnswer,
  updateQuizAnswer: quizService.updateQuizAnswer,
  deleteQuizAnswer: quizService.deleteQuizAnswer,
  
  // Certificate related functions
  getUserCertificates: certificateService.getUserCertificates,
  
  // Storage related functions
  uploadVideo: storageService.uploadVideo,
  uploadImage: storageService.uploadImage,
};

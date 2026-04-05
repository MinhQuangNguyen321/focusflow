import React, { createContext, useContext } from 'react';

// Centralised translation dictionary
const translations = {
  English: {
    // Navigation & Shell
    'Home': 'Home',
    'Focus': 'Focus',
    'Notes': 'Notes',
    'Calendar': 'Calendar',
    'Settings': 'Settings',
    'Welcome Back': 'Welcome Back',
    'Guest': 'Guest',
    'Total Tasks': 'Total Tasks',
    'Completed': 'Completed',
    'Events': 'Events',
    'Folders': 'Folders',
    'Recent Tasks': 'Recent Tasks',
    'View All': 'View All',
    'All clear for today!': 'All clear for today!',
    'Upcoming Events': 'Upcoming Events',
    'Nothing scheduled.': 'Nothing scheduled.',
    'Create Event': 'Create Event',
    'Start Timer': 'Start Timer',
    'Focus Session': 'Focus Session',
    
    // Tasks Page
    'All': 'All',
    'Pending': 'Pending',
    'Folder': 'Folder',
    'All Tasks': 'All Tasks',
    'Viewing': 'Viewing',
    'total tasks in this folder.': 'total tasks in this folder.',
    'Search tasks...': 'Search tasks...',
    'Remaining': 'Remaining',
    'Done': 'Done',
    'No tasks found here.': 'No tasks found here.',
    'No Date': 'No Date',
    'High': 'High',
    'Medium': 'Medium',
    
    // AI Assistant
    'Ask AI': 'Ask AI',
    "Type what you need, and I'll create the tasks and events automatically.": "Type what you need, and I'll create the tasks and events automatically.",
    'Nexus AI Assistant': 'Nexus AI Assistant',
    'Active & Listening': 'Active & Listening',
    'Ask AI to create a task...': 'Ask AI to create a task...',
    
    // Settings Page
    'Account Settings': 'Account Settings',
    'Manage your FocusFlow identity, preferences, and security.': 'Manage your FocusFlow identity, preferences, and security.',
    'Core Identity': 'Core Identity',
    'Personal Information': 'Personal Information',
    'User Preferences': 'User Preferences',
    'Inspiration & Empty States': 'Inspiration & Empty States',
    'Account Security': 'Account Security',
    'Delete Account': 'Delete Account',
    'Change Password': 'Change Password',
    'Interface Theme': 'Interface Theme',
    'Browser Notifications': 'Browser Notifications',
    'Language': 'Language',
    'Display Name': 'Display Name',
    'Avatar Image URL (Optional)': 'Avatar Image URL (Optional)',
    'Bio / Headline': 'Bio / Headline',
    'Job Title / Role': 'Job Title / Role',
    'Location / Timezone': 'Location / Timezone',
    'Edit Profile': 'Edit Profile',
    'Save': 'Save',
    'Integrations': 'Integrations',
    'Google Calendar': 'Google Calendar',
    'Gemini API Key': 'Gemini API Key'
  },
  Vietnamese: {
    // Navigation & Shell
    'Home': 'Trang Chủ',
    'Focus': 'Tập Trung',
    'Notes': 'Ghi Chú',
    'Calendar': 'Lịch',
    'Settings': 'Cài Đặt',
    'Dashboard': 'Tổng Quan',

    // Dashboard
    'Welcome Back': 'Chào Mừng Trở Lại',
    'Guest': 'Khách',
    'You have': 'Bạn có',
    'tasks and': 'công việc và',
    'events scheduled.': 'sự kiện sắp tới.',
    'Nexus AI Assistant': 'Trợ Lý Nexus AI',
    "Type what you need, and I'll create the tasks and events automatically.": 'Gõ thứ bạn cần, AI sẽ tự động tạo công việc và sự kiện.',
    'Ask AI': 'Hỏi AI',
    'Recent Tasks': 'Công Việc Gần Đây',
    'View All': 'Xem Tất Cả',
    'Upcoming Events': 'Sự Kiện Sắp Tới',
    'Nothing scheduled.': 'Chưa có lịch trình.',
    'All clear for today!': 'Hôm nay không có việc gì!',
    'Create Event': 'Tạo Sự Kiện',
    'Focus Session': 'Phiên Tập Trung',
    'Start Timer': 'Bắt Đầu Đếm Giờ',
    'Total Tasks': 'Tổng Công Việc',
    'Completed': 'Đã Hoàn Thành',
    'Events': 'Sự Kiện',
    'Folders': 'Thư Mục',

    // Tasks Page
    'All': 'Tất Cả',
    'Pending': 'Đang Chờ',
    'Done': 'Đã xong',
    'Remaining': 'Còn lại',
    'Folder': 'Thư mục',
    'All Tasks': 'Tất Cả Công Việc',
    'Viewing': 'Đang xem',
    'total tasks in this folder.': 'công việc trong thư mục này.',
    'Search tasks...': 'Tìm kiếm công việc...',
    'No tasks found here.': 'Không tìm thấy công việc nào.',
    'No Date': 'Không Có Ngày',
    'High': 'Cao',
    'Medium': 'Trung Bình',
    'General': 'Chung',

    // Notes Page
    'Your Notes': 'Ghi Chú Của Bạn',
    'Organize your thoughts, ideas, and inspirations.': 'Lưu lại ý tưởng, cảm hứng và suy nghĩ của bạn.',
    'Search thoughts...': 'Tìm kiếm ghi chú...',
    'No notes found': 'Không tìm thấy ghi chú nào',

    // Focus Page
    'Focus Mode': 'Chế Độ Tập Trung',
    'Block distractions and accomplish your tasks.': 'Loại bỏ xao nhãng và hoàn thành công việc.',
    'Notifications On': 'Thông Báo Đang Bật',
    'Enable Notifications': 'Bật Thông Báo',
    'Custom Timer': 'Hẹn Giờ Tùy Chỉnh',
    'Set': 'Đặt',

    // Calendar Page
    'Timeline': 'Dòng Thời Gian',
    'Month': 'Tháng',
    'Day': 'Ngày',
    'Quick Task': 'Thêm Nhanh Việc',
    'New Event': 'Sự Kiện Mới',
    'Jump to Today': 'Về Hôm Nay',
    'Clear Calendar': 'Xóa Hoạt Động',
    'Clear All Activities': 'Xóa Tất Cả Sự Kiện',
    'Deletes every event and task.': 'Xóa sạch mọi công việc và sự kiện đã tạo.',
    'Clear Specific Range': 'Xóa Theo Khoảng Ngày',
    'Only delete within selected dates.': 'Chỉ xóa các mục nằm trong khoảng ngày bạn chọn.',
    'Start Date': 'Ngày Bắt Đầu',
    'End Date': 'Ngày Kết Thúc',
    'Cancel': 'Hủy',
    'Confirm Delete': 'Xác Nhận Xóa',
    'No activities scheduled': 'Chưa có hoạt động nào',
    'Activity Added': 'Đã Thêm Hoạt Động',

    // AI Assistant
    "Type what you need, and I'll create the tasks and events automatically.": 'Gõ thứ bạn cần, AI sẽ tạo công việc/sự kiện tự động.',
    'Nexus AI Assistant': 'Trợ Lý Nexus AI',
    'Active & Listening': 'Đang Lắng Nghe',
    'Ask AI to create a task...': 'Yêu cầu AI tạo tác vụ...',

    // Settings Page
    'Account Settings': 'Cài Đặt Tài Khoản',
    'Manage your FocusFlow identity, preferences, and security.': 'Quản lý thông tin, tùy chọn và bảo mật FocusFlow của bạn.',
    'Core Identity': 'Hồ Sơ Cốt Lõi',
    'Personal Information': 'Thông Tin Cá Nhân',
    'User Preferences': 'Tùy Chọn Người Dùng',
    'Inspiration & Empty States': 'Cảm Hứng & Lời Trích Dẫn',
    'Account Security': 'Bảo Mật Tài Khoản',
    'Delete Account': 'Xóa Tài Khoản',
    'Change Password': 'Đổi Mật Khẩu',
    'Interface Theme': 'Giao Diện Sáng/Tối',
    'Browser Notifications': 'Thông Báo Trình Duyệt',
    'Language': 'Ngôn Ngữ',
    'Display Name': 'Tên Hiển Thị',
    'Avatar Image URL (Optional)': 'Đường Dẫn Ảnh Đại Diện (Tùy Chọn)',
    'Bio / Headline': 'Tiểu Sử / Tiêu Đề',
    'Job Title / Role': 'Nghề Nghiệp / Vai Trò',
    'Location / Timezone': 'Vị Trí / Múi Giờ',
    'Edit Profile': 'Sửa Hồ Sơ',
    'Save': 'Lưu',
    'Integrations': 'Tích Hợp Bên Ngoài',
    'Google Calendar': 'Lịch Google',
    'Gemini API Key': 'Mã API Gemini',
    'Save Changes': 'Lưu Thay Đổi',
    'Saving...': 'Đang lưu...',
    'Request Reset': 'Yêu Cầu Đặt Lại',
    'Member Since': 'Thành Viên Từ',
    'Danger Zone': 'Vùng Nguy Hiểm',
    'Add Quote': 'Thêm Câu Trích',
    'Connect': 'Kết Nối',
    'Disconnect': 'Ngắt Kết Nối',
    'Dark Mode': 'Chế Độ Tối',
    'Light Mode': 'Chế Độ Sáng',
    'Enabled': 'Đã Bật',
    'Disabled': 'Đã Tắt'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ language, children }) => {
  const currentLang = translations[language] ? language : 'English';
  
  const t = (key) => {
    return translations[currentLang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t, language: currentLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a dummy object if used outside provider
    return { t: (k) => k, language: 'English' };
  }
  return context;
};

import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, X, ChevronRight, ChevronLeft, CheckCircle2, Play, LayoutDashboard, Focus, FileText, CalendarDays, Settings2, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HELP_CONTENT = {
  dashboard: {
    title: 'Tổng Quan (Dashboard)',
    icon: <LayoutDashboard size={22} />,
    color: 'blue',
    steps: [
      {
        title: 'Chào mừng đến với FocusFlow! 🎉',
        desc: 'Đây là trung tâm điều hành nỗ lực của bạn. Bạn có thể xem nhanh số tác vụ còn lại, các sự kiện trong ngày và phiên tập trung tiếp theo.',
        tip: 'Dashboard giúp bạn có cái nhìn tổng thể mà không cần chuyển tab thủ công.',
        img: null
      },
      {
        title: 'Trợ lý Nexus AI ✨',
        desc: 'Nhấn vào banner màu xanh ở trên để mở AI. Bạn có thể gõ "Tạo lịch họp lúc 3h chiều mai" hoặc "Thêm việc học code vào thư mục Work", AI sẽ tự động xử lý cho bạn.',
        tip: 'AI Assistant giúp bạn tiết kiệm thời gian nhập liệu thủ công cực kỳ hiệu quả.',
        img: null
      },
      {
        title: 'Nút Hỏi Đáp [?] Thông Minh',
        desc: 'Ở góc phải dưới mỗi trang luôn có nút [?]. Mỗi trang sẽ có bộ hướng dẫn riêng biệt phù hợp với chức năng bạn đang xem.',
        tip: 'Nếu quên cách dùng một tính năng, hãy tìm nút tròn trắng này nhé!',
        img: null
      },
      {
        title: 'Thanh điều hướng linh hoạt',
        desc: 'Dùng Sidebar bên trái để chuyển đổi giữa Dashboard, Tasks, Calendar, Notes và Focus Mode.',
        tip: 'Trên di động, nhấn vào chữ FocusFlow trên đầu để quay về Dashboard nhanh nhất.',
        img: null
      }
    ]
  },
  tasks: {
    title: 'Quản lý Công Việc (Tasks)',
    icon: <ListTodo size={22} />,
    color: 'violet',
    steps: [
      {
        title: 'Tổ chức theo Thư Mục',
        desc: 'Bạn có thể chia nhỏ công việc vào các folder như Work, Personal, Ideas. Chọn folder ở sidebar để lọc danh sách ngay lập tức.',
        tip: 'Tasks không có folder sẽ nằm trong mục "General".',
        img: null
      },
      {
        title: 'Độ ưu tiên và Ngày hạn',
        desc: 'Mỗi Task có thể đặt mức "High" (Đỏ) hoặc "Medium" (Xanh). Gắn ngày hạn sẽ giúp Task xuất hiện trong lịch của bạn.',
        tip: 'Task "High" sẽ luôn được ưu tiên hiển thị lên đầu danh sách.',
        img: null
      },
      {
        title: 'Xóa hàng loạt (Tính năng mới) 🗑️',
        desc: 'Bên cạnh thanh tìm kiếm có icon thùng rác đỏ. Nhấn vào để xóa tất cả Task, xóa theo folder, hoặc xóa các Task cũ trước một ngày cụ thể.',
        tip: 'Hãy cẩn thận! Thao tác xóa hàng loạt không thể hoàn tác.',
        img: null
      }
    ]
  },
  calendar: {
    title: 'Lịch Cá Nhân (Calendar)',
    icon: <CalendarDays size={22} />,
    color: 'indigo',
    steps: [
      {
        title: 'Lịch Google và Lịch Nội Bộ',
        desc: 'Sự kiện Google Calendar sẽ có màu sắc đặc trưng khi bạn kết nối. Bạn có thể xem song song cả task và sự kiện trên cùng một lưới.',
        tip: 'Sự kiện Google chỉ có thể xem, bạn cần vào ứng dụng Google Calendar để chỉnh sửa chúng.',
        img: null
      },
      {
        title: 'Chế độ Timeline (Dòng thời gian)',
        desc: 'Nhấn nút "Timeline" ở góc phải trên để xem lịch trình chi tiết theo từng giờ trong ngày.',
        tip: 'Kéo chuột để xem các khung giờ khác nhau trong ngày.',
        img: null
      },
      {
        title: 'Dọn dẹp Lịch trình 🧹',
        desc: 'Nút "Clear Calendar" giúp bạn xóa sạch lịch sự kiện hoặc chỉ xóa trong một khoảng ngày (ví dụ: xóa hết sự kiện của tháng trước).',
        tip: 'Bạn nên dọn dẹp lịch định kỳ để giữ giao diện gọn gàng.',
        img: null
      }
    ]
  },
  focus: {
    title: 'Chế Độ Tập Trung (Focus)',
    icon: <Focus size={22} />,
    color: 'rose',
    steps: [
      {
        title: 'Phương pháp Pomodoro',
        desc: 'Sử dụng các preset 25p, 5p hoặc 15p để duy trì sự tập trung tối đa mà không bị kiệt sức.',
        tip: 'Nghỉ ngắn 5p là chìa khóa để não bộ phục hồi năng lượng.',
        img: null
      },
      {
        title: 'Âm thanh thông báo',
        desc: 'Đảm bảo trình duyệt đã cấp quyền thông báo để FocusFlow có thể "ting ting" nhắc bạn khi hết giờ.',
        tip: 'Bạn có thể làm việc ở tab khác, âm thanh vẫn sẽ phát khi kết thúc.',
        img: null
      }
    ]
  },
  notes: {
    title: 'Ghi Chú Nhanh (Notes)',
    icon: <FileText size={22} />,
    color: 'amber',
    steps: [
      {
        title: 'Trình soạn thảo Cao cấp',
        desc: 'Mở một ghi chú để viết ý tưởng. Ghi chú của bạn được lưu tự động ngay khi bạn gõ.',
        tip: 'Dùng icon thùng rác trên mỗi thẻ ghi chú để xóa những nội dung không còn cần thiết.',
        img: null
      },
      {
        title: 'Phân loại theo màu sắc',
        desc: 'Mỗi ghi chú có thể chọn một màu nền riêng biệt. Bạn có thể dùng màu Xanh cho việc học, màu Vàng cho ý tưởng kinh doanh...',
        tip: 'Màu sắc giúp bạn nhận diện ghi chú nhanh hơn 50% so với đọc tiêu đề.',
        img: null
      }
    ]
  },
  settings: {
    title: 'Cài Đặt & Tài Khoản (Settings)',
    icon: <Settings2 size={22} />,
    color: 'slate',
    steps: [
      {
        title: 'Kết nối Google Calendar 🔗',
        desc: 'Nhấn "Connect" và đăng nhập Google. Chú ý: Vì ứng dụng đang phát triển, bạn cần nhấn "Advanced" -> "Go to focusflow (unsafe)" để tiếp tục.',
        tip: 'Đừng lo lắng, thông báo "unsafe" là do ứng dụng chưa được Google xác thực chính thức.',
        img: null
      },
      {
        title: 'Trợ lý AI đã sẵn sàng ✨',
        desc: 'Hệ thống đã được thiết lập sẵn trí tuệ nhân tạo Gemini. Bạn có thể sử dụng tính năng "Ask AI" ngay mà không cần cài đặt thêm gì.',
        tip: 'Nếu muốn dùng mã API riêng của mình, bạn vẫn có thể dán vào mục Gemini API Key trong Settings.',
        img: null
      },
      {
        title: 'Cá nhân hóa Giao diện',
        desc: 'Chuyển đổi Dark Mode/Light Mode và thay đổi Ngôn ngữ (Vietnamese/English) tùy theo sở thích của bạn.',
        tip: 'FocusFlow ghi nhớ cài đặt này trên mọi thiết bị bạn đăng nhập.',
        img: null
      }
    ]
  }
};

const COLOR_SCHEME = {
  blue: { header: 'from-blue-600 to-indigo-600', badge: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200', tip: 'bg-blue-50 border-blue-100 text-blue-700', dot: 'bg-blue-600' },
  violet: { header: 'from-violet-600 to-purple-600', badge: 'bg-violet-100 text-violet-700', btn: 'bg-violet-600 hover:bg-violet-700 shadow-violet-200', tip: 'bg-violet-50 border-violet-100 text-violet-700', dot: 'bg-violet-600' },
  indigo: { header: 'from-indigo-600 to-blue-600', badge: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200', tip: 'bg-indigo-50 border-indigo-100 text-indigo-700', dot: 'bg-indigo-600' },
  rose: { header: 'from-rose-500 to-pink-600', badge: 'bg-rose-100 text-rose-700', btn: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200', tip: 'bg-rose-50 border-rose-100 text-rose-700', dot: 'bg-rose-500' },
  amber: { header: 'from-amber-500 to-orange-500', badge: 'bg-amber-100 text-amber-700', btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200', tip: 'bg-amber-50 border-amber-100 text-amber-700', dot: 'bg-amber-500' },
  slate: { header: 'from-slate-700 to-slate-900', badge: 'bg-slate-100 text-slate-700', btn: 'bg-slate-700 hover:bg-slate-800 shadow-slate-200', tip: 'bg-slate-50 border-slate-200 text-slate-700', dot: 'bg-slate-700' },
};

const HelpWidget = ({ activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const seenRef = useRef(false);

  const sectionKey = HELP_CONTENT[activeSection] ? activeSection : 'dashboard';
  const content = HELP_CONTENT[sectionKey];
  const scheme = COLOR_SCHEME[content.color];
  const totalSteps = content.steps.length;

  // Auto-show on dashboard only once
  useEffect(() => {
    if (activeSection === 'dashboard' && !seenRef.current) {
      const hasSeen = sessionStorage.getItem('ff_help_shown');
      if (!hasSeen) {
        setTimeout(() => { setIsOpen(true); setStep(0); }, 800);
        sessionStorage.setItem('ff_help_shown', 'true');
      }
      seenRef.current = true;
    }
  }, [activeSection]);

  // Reset step when section changes
  useEffect(() => {
    setStep(0);
  }, [activeSection]);

  const currentStep = content.steps[step];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setIsOpen(true); setStep(0); }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-2xl border border-slate-100 hover:border-blue-200 text-blue-600 hover:text-blue-700 transition-all group"
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      >
        <HelpCircle size={28} strokeWidth={2.5} />
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none shadow-xl">
          Hướng dẫn
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-800" />
        </span>
      </motion.button>

      {/* Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.88, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className={`bg-gradient-to-br ${scheme.header} p-6 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
                  <div className="absolute bottom-0 -left-6 w-28 h-28 rounded-full bg-white" />
                </div>
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/20 p-1.5 rounded-lg">{content.icon}</span>
                      <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Hướng dẫn</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">{content.title}</h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Step indicator dots */}
                <div className="relative flex gap-2 mt-5">
                  {content.steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Bước {step + 1} / {totalSteps}
                    </p>
                    <h3 className="text-lg font-black text-slate-800 mb-3 leading-snug">
                      {currentStep.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {currentStep.desc}
                    </p>
                    <div className={`p-3.5 rounded-2xl border text-xs font-semibold leading-relaxed ${scheme.tip}`}>
                      💡 <strong>Mẹo:</strong> {currentStep.tip}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> Trước
                </button>

                <span className="text-xs font-bold text-slate-400">{step + 1} / {totalSteps}</span>

                {step < totalSteps - 1 ? (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 ${scheme.btn}`}
                  >
                    Tiếp <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 ${scheme.btn}`}
                  >
                    <CheckCircle2 size={16} /> Đã hiểu!
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpWidget;

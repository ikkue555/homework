import React from 'react';
import { SiteSettings } from '../types';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  siteSettings?: SiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ siteSettings }) => {
  const schoolName = siteSettings?.footerSchoolName || 'ระบบจัดการการบ้านโรงเรียน สวนกุหลาบวิทยาลัย';
  const contactText = siteSettings?.footerContactText || 'ระบบบันทึกและติดตามการบ้านออนไลน์ เชื่อมต่อและซิงค์ข้อมูลเรียลไทม์ทุกอุปกรณ์';

  return (
    <footer className="mt-12 bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8 text-slate-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100/80 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-800">
              {schoolName}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {contactText}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>ซิงค์ Firestore Cloud เรียลไทม์</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <span>พัฒนาด้วย</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            <span>สำหรับนักเรียนทุกคน</span>
          </span>
        </div>
      </div>
    </footer>
  );
};


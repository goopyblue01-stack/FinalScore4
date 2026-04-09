import { ArrowLeft } from 'lucide-react';

export default function Terms({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-lg">이용약관</h2>
      </header>
      <main className="max-w-3xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
            <section>
              <h4 className="font-bold text-slate-800 text-base mb-2">제1조 (목적)</h4>
              <p>본 약관은 ScoredLab(이하 '본 사이트')이 제공하는 축구 데이터 분석 및 경기 예측 정보 서비스의 이용 조건 및 운영에 관한 기본적인 사항을 규정함을 목적으로 합니다.</p>
            </section>
            <section>
              <h4 className="font-bold text-slate-800 text-base mb-2">제2조 (서비스의 성격 및 면책 조항)</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>본 사이트에서 제공하는 모든 경기 예상 스코어, 승률 확률, 해외 배당 정보 등은 통계적 모델링에 의한 '참고용 데이터'입니다.</li>
                <li>본 사이트는 제공되는 데이터의 100% 정확성이나 신뢰성을 보증하지 않습니다.</li>
                <li className="text-red-500 font-bold">본 사이트의 정보는 정보 제공 및 오락 목적으로만 제공되며, 어떠한 경우에도 스포츠 베팅, 도박, 기타 금전적 투자를 권유하거나 조장하지 않습니다.</li>
                <li>사용자가 본 사이트의 정보를 활용하여 행한 베팅, 투자 등의 모든 의사결정과 그로 인해 발생한 직·간접적인 재산상 손실이나 법적 문제에 대해 본 사이트와 운영자는 일체의 법적 책임을 지지 않습니다.</li>
              </ol>
            </section>
            <section>
              <h4 className="font-bold text-slate-800 text-base mb-2">제3조 (지적재산권)</h4>
              <p>본 사이트가 자체적으로 개발한 예측 알고리즘, 디자인, 텍스트 등 모든 콘텐츠의 저작권은 ScoredLab에 있으며, 무단 복제, 배포, 상업적 이용을 엄격히 금지합니다.</p>
            </section>
            <section>
              <h4 className="font-bold text-slate-800 text-base mb-2">제4조 (서비스의 변경 및 중단)</h4>
              <p>본 사이트는 데이터 제공 API 업체의 상황이나 시스템 점검 등에 따라 사전 통지 없이 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

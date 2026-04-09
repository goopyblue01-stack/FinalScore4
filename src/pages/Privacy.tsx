import { ArrowLeft } from 'lucide-react';

export default function Privacy({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-lg">개인정보처리방침</h2>
      </header>
      <main className="max-w-3xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
            <p>ScoredLab(이하 '본 사이트')은 사용자의 개인정보 보호를 매우 중요하게 생각하며, 관련 법령을 준수합니다. 본 방침은 사이트 이용 시 수집되는 정보와 활용 방식에 대해 설명합니다.</p>
            
            <section>
              <h4 className="font-bold text-slate-800 text-base mb-2">1. 수집하는 개인정보 항목</h4>
              <p>본 사이트는 회원가입 절차 없이 누구나 자유롭게 이용할 수 있으며, 사용자의 민감한 개인 식별 정보(이름, 전화번호, 이메일 등)를 직접 수집하거나 저장하지 않습니다.</p>
            </section>
            
            <section>
              <h4 className="font-bold text-slate-800 text-base mb-2">2. 쿠키(Cookie)의 사용 및 제3자 광고</h4>
              <p className="mb-2">본 사이트는 사용자에게 맞춤형 서비스와 광고를 제공하기 위해 '쿠키(Cookie)'를 사용합니다. 쿠키는 웹사이트가 사용자의 브라우저에 전송하는 소량의 정보입니다.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>본 사이트는 Google AdSense를 포함한 제3자 광고 공급업체의 광고를 게재할 수 있습니다.</li>
                <li>Google을 포함한 제3자 공급업체는 쿠키를 사용하여 사용자가 본 사이트 또는 다른 웹사이트를 과거에 방문한 기록을 기반으로 맞춤 광고를 게재합니다.</li>
                <li>Google의 광고 쿠키 사용으로 인해 Google 및 파트너는 인터넷에서 본 사이트 및 다른 사이트 방문 기록을 바탕으로 사용자에게 적절한 광고를 게재할 수 있습니다.</li>
                <li>사용자는 언제든지 웹 브라우저의 옵션을 설정하여 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h4 className="font-bold text-slate-800 text-base mb-2">3. 로그 데이터</h4>
              <p>사용자가 본 사이트를 방문할 때, 브라우저 유형, IP 주소, 방문 시간 및 페이지 이동 기록 등의 비식별 통계 데이터가 자동으로 수집될 수 있으며, 이는 사이트 성능 개선 및 서버 트래픽 분석의 목적으로만 사용됩니다.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

import { ArrowLeft } from 'lucide-react';

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-lg">ScoredLab 소개</h2>
      </header>
      <main className="max-w-3xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 mb-6">[ScoredLab: 모든 분석이 '완료된(Scored)' 최적의 예측 데이터 연구소]</h3>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
            <p><strong>ScoredLab</strong>에 오신 것을 환영합니다.</p>
            <p>우리의 이름에 담긴 <strong>'Scored(-ed)'</strong>는 수학적 계산과 통계적 검증이 이미 완벽하게 끝났음(Completed)을 의미합니다. ScoredLab은 파편화된 전 세계 축구 데이터를 수집하여, 사용자에게 도달하기 전 이미 최적의 '스코어링(Scoring)'을 마친 가장 정교한 형태의 예측 데이터를 제공하는 전문 축구 연구소입니다.</p>
            <p>ScoredLab의 하이브리드 예측 엔진은 직관이나 감정에 흔들리지 않으며, 다음과 같은 고도화된 수리적 로직을 통해 작동합니다.</p>
            <ul className="list-disc pl-5 space-y-2 mt-4 font-medium text-slate-700">
              <li><strong>최근성 가중치 모델 (Time-Decay Form):</strong> 팀의 과거 성적보다 '가장 최근의 기세'에 높은 가중치를 부여하여, 팀의 실시간 컨디션과 전력 변동성을 정확하게 포착합니다.</li>
              <li><strong>리그별 환경 변수 보정:</strong> 유럽 주요 리그부터 아시아, 아메리카까지 각 리그가 가진 고유의 평균 득점률을 수식에 반영하여, 리그 특성에 맞는 정밀한 기대 득점(xG)을 산출합니다.</li>
              <li><strong>포아송-Elo 하이브리드 결합 (Golden Level):</strong> 팀의 순수 퍼포먼스 데이터(포아송 분포)와 글로벌 베팅 시장의 배당률에 숨겨진 집단 지성(Elo 보정치)을 최적의 비율로 결합합니다. 이를 통해 시장의 심리적 편향(Noise)을 완벽히 제거합니다.</li>
            </ul>
            <p className="pt-4">복잡한 데이터 분석은 저희가 모두 끝마쳤습니다. 여러분은 ScoredLab이 도출해 낸 <strong>'가장 객관적이고 완성된(Scored) 통찰력'</strong>을 그저 즐기시기만 하면 됩니다.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

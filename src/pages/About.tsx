import { ArrowLeft } from 'lucide-react';

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-lg">ScoreLab 소개</h2>
      </header>
      <main className="max-w-3xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 mb-6">[ScoreLab: 데이터로 축구를 해독하는 하이브리드 예측 엔진]</h3>
          <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
            <p>ScoreLab에 오신 것을 환영합니다.</p>
            <p>ScoreLab은 단순한 축구 스코어 제공 사이트가 아닙니다. 현대 축구의 방대한 데이터를 기반으로, 최첨단 데이터 사이언스와 통계학적 모델링을 결합하여 가장 정교한 경기 결과를 예측하는 '전문 축구 예측 플랫폼'입니다.</p>
            <p>ScoreLab의 예측 엔진은 직관이나 감정에 흔들리지 않으며, 다음과 같은 고도화된 수리적 로직을 통해 작동합니다.</p>
            <ul className="list-disc pl-5 space-y-2 mt-4 font-medium text-slate-700">
              <li><strong>최근성 가중치 모델 (Time-Decay Form):</strong> 팀의 과거 성적보다 '가장 최근의 기세'에 높은 가중치를 부여하여, 팀의 실시간 컨디션과 전력 변동성을 정확하게 포착합니다.</li>
              <li><strong>리그별 환경 변수 보정:</strong> 유럽 주요 리그부터 아시아, 아메리카까지 각 리그가 가진 고유의 평균 득점률을 수식에 반영하여, 리그 특성에 맞는 정밀한 기대 득점(xG)을 산출합니다.</li>
              <li><strong>포아송-Elo 하이브리드 결합 (Golden Level):</strong> 팀의 순수 퍼포먼스 데이터(포아송 분포 기반)와 글로벌 베팅 시장의 배당률에 숨겨진 집단 지성(Elo 보정치)을 최적의 비율로 결합합니다. 이를 통해 시장의 심리적 편향(Noise)을 제거하고 가장 객관적인 승·무·패 확률을 제공합니다.</li>
            </ul>
            <p className="pt-4">ScoreLab은 전 세계 주요 리그 및 국제 대회를 커버하며, 축구 팬과 데이터 분석가들에게 새로운 시각과 깊이 있는 인사이트를 제공하기 위해 끊임없이 알고리즘을 고도화하고 있습니다.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
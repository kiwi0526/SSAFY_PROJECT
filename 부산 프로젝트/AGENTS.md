1) vue3 기반의 프론트엔드 단일 구조(정적 spa)
2) 공공데이터 기반 지역정보 커뮤니티 'LocalHub' 개발

규칙:

1. 내가 시킨것 외에는 아무것도 말아줘
2. 개발 완료후 자동으로 App을 실행해줘
3. 나는 비개발자이므로, 내가 모호하게 시켜도 내 의도를 파악해서 질문하지말고 알아서 파악해줘

데이터 참조(간략):

- 위치: `docs/data`에 mock JSON 저장
- 용도: 초기/모의 데이터(seed) — 지역, POI, 이벤트 등
- 형식 예시: {id,name,type,latitude,longitude,address,tags}
- 로드: 정적 import 또는 `fetch('/docs/data/파일명.json')`
- 주의: mock은 개발용이며 실 API 도입 시 교체/문서화

PHASES 문서:

- 개발 단계별 정의는 `docs/PHASES/PHASE1 ~ 7.md`를 참고합니다. 각 Phase에는 명확한 완료 기준(체크리스트)이 포함되어야 합니다.

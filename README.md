# 사랑은 유행 📚 – 책 추천 & 독서 후기 SNS

> 지금 나에게 필요한 책, 냠냠 골라줄게요!

기분·고민·MBTI에 맞는 책을 추천받고, 독서 후기를 나누는 모바일 중심 SNS입니다.
파스텔 오렌지 + 옐로 톤의 귀여운 디자인과 펼친 책을 머리에 쓴 캐릭터 **냠냠이**(`public/nyamnyam.svg`)가 함께해요.

- **배포 주소**: https://ssing9090-sys.github.io/mini_sns/
- **기술 스택**: React 19 + Vite + MUI + Supabase(PostgreSQL, Auth) + GitHub Pages

## 주요 화면

| 페이지 | 경로 | 기능 |
| --- | --- | --- |
| 홈 | `#/` | 오늘의 맞춤 책, 감정 버튼별 추천, 인기 도서, 후기 미리보기 |
| 피드 | `#/feed` | 최신순/인기순 정렬, 장르 필터, 좋아요 |
| 게시물 상세 | `#/posts/:id` | 별점·후기, 좋아요, 댓글, 저장, 공유, 팔로우, AI 비슷한 책 추천 |
| 게시물 작성/수정 | `#/write`, `#/posts/:id/edit` | 책 검색·선택(직접 등록 가능), 별점, 후기, 해시태그, Unsplash 사진 선택 |
| 로그인/회원가입 | `#/login`, `#/signup` | 이메일 로그인, SNS 로그인 버튼(준비 중) |
| 마이페이지 | `#/my` | 프로필 수정, 책장 UI, 내 후기, 저장함, 독서 통계, 독서 목표, 로그아웃 |
| 나에게 맞는 책 찾기 | `#/find` | 기분 → 고민 → MBTI → 장르 → 목적 설문 후 3권 추천, 내 책장에 담기 |
| 검색 / 알림 | `#/search`, `#/notifications` | 도서 검색, 내 글의 좋아요·댓글·새 팔로워 알림 |

## 데이터베이스 (Supabase)

같은 Supabase 프로젝트의 다른 앱과 겹치지 않도록 모든 테이블에 `sns_` 접두사를 붙였습니다.

| 테이블 | 설명 |
| --- | --- |
| `sns_users` | 사용자 프로필 (비밀번호는 Supabase Auth가 암호화 보관) |
| `sns_books` | 도서 정보 + 추천용 태그(감정/고민/목적/MBTI) |
| `sns_posts` | 독서 후기 (책, 별점, 해시태그, 이미지 URL, 좋아요 수) |
| `sns_comments` | 댓글 |
| `sns_likes` | 좋아요 (사용자+게시물 중복 불가, 트리거로 `likes_count` 자동 반영) |
| `sns_user_books` | 나만의 책장 (읽고 싶어요 / 읽는 중 / 완독) |
| `sns_saved_posts` | 저장한 게시물 |
| `sns_follows` | 팔로우 |

모든 테이블에 RLS(행 수준 보안)가 켜져 있어, 본인 데이터만 쓰기·수정·삭제할 수 있습니다.

## 로컬 실행

```bash
npm install
# .env 파일에 아래 값 입력
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_UNSPLASH_ACCESS_KEY=   (선택)
npm run dev
```

## 배포

`main` 브랜치에 push 하면 GitHub Actions(`.github/workflows/deploy.yml`)가 자동으로 빌드해 GitHub Pages에 배포합니다.
저장소 **Settings → Secrets and variables → Actions** 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`(필수), `VITE_UNSPLASH_ACCESS_KEY`(선택)를 등록하세요.

## 참고

- **Unsplash 이미지**: Access Key가 없으면 미리 골라둔 Unsplash 독서 사진 32장 중 무작위로 보여줍니다.
- **AI 추천**: 도서 태그와 사용자 선택을 점수화하는 규칙 기반 추천입니다.
- **SNS 로그인**: Supabase 대시보드에서 Kakao/Google 공급자를 설정하면 연결할 수 있습니다.

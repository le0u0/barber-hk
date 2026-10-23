import { CutBoard } from "./cut-board";
import { HomeIntro } from "./home-intro";

export default function Home() {
  return (
    <main className="page">
      <HomeIntro />
      <CutBoard />
    </main>
  );
}

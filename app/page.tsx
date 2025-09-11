import MainHeadline from "@/components/MainHeadline";
import Projects from "./projects/Projects";

export default function Home() {
  return (
    <>
      <div className="container-site">
        <MainHeadline>
          <span className="font-extralight">Menschen </span>
          <strong className="font-bold">verbinden</strong>
          <span className="font-extralight">
            , <br />
            Veränderung{" "}
          </span>
          <strong className="font-bold">bewirken</strong>
        </MainHeadline>
        <Projects />
      </div>
    </>
  );
}

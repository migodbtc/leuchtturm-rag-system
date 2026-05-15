import { BrainCircuit, CameraIcon, Code, Link2, Star } from "lucide-react";

export default function CreditsPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section className="w-full flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-amber-800 flex flex-row gap-2 items-center">
          <Star className="text-amber-300" /> Credits
        </h1>
        <p className="text-sm text-gray-600">
          Crediting the people who are owed proper citation.
        </p>
      </section>

      <section className="w-full grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div className="rounded-lg border border-slate-300 bg-white p-5 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-black flex flex-row gap-2 items-center">
            <BrainCircuit className="text-amber-300" /> Leuchtturm RAG System
          </h2>
          <p className="text-sm text-gray-700 text-justify wrap-break-word">
            <b className="bg-linear-to-r from-[#ac7414] to-[#ffe500] bg-clip-text text-transparent uppercase font-semibold">
              Yellowpad{"  "}
            </b>
            was designed and developed to be part of a bigger project.
          </p>
          <p className="text-sm text-gray-700 text-justify wrap-break-word">
            This project serves as a component in a bigger infrastructure
            involving RAG systems, vector databases, and Google API as the core
            LLM engine. The objective is to create a small-scale infrastructure
            that could retrive context and information from existing web
            applications in order to output for operations (in this case, the
            main operation would be just a simple chat interface).
          </p>
          <p className="text-sm text-gray-700 text-justify wrap-break-word">
            The project is also a system inspired by{" "}
            <a
              className="text-amber-700 hover:text-amber-800 underline underline-offset-4"
              href="https://www.youtube.com/watch?v=CS5Cmz5FssI"
              target="_blank"
              rel="noreferrer"
            >
              the system infrastructure done by software-facing enterprises or
              businesses such as Uber, AirBnb, Intercom, Microsoft, and Meta
            </a>{" "}
            in developing their foundational infrastructure as opposed to
            shipping AI-generated production features.
          </p>
          <table className="mt-2 w-full text-sm text-gray-700 border-separate border-spacing-y-2">
            <tbody>
              <tr>
                <td className="p-0 font-bold text-black">
                  <span className="inline-flex items-center gap-2">
                    <Link2 className="text-amber-600" size={16} />
                    Leuchtturm Github Repository
                  </span>
                </td>
                <td className="p-0 text-right">
                  <a
                    className="text-amber-700 hover:text-amber-800 underline underline-offset-4"
                    href="https://github.com/migodbtc/leuchtturm-rag-system"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Github Page
                  </a>
                </td>
              </tr>
              <tr>
                <td className="p-0 font-bold text-black">
                  <span className="inline-flex items-center gap-2">
                    <Code className="text-amber-600" size={16} />
                    migodbtc
                  </span>
                </td>
                <td className="p-0 text-right">
                  <a
                    className="text-amber-700 hover:text-amber-800 underline underline-offset-4"
                    href="https://github.com/migodbtc"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Github Profile
                  </a>
                </td>
              </tr>
              <tr>
                <td className="p-0 font-bold text-black">
                  <span className="inline-flex items-center gap-2">
                    <CameraIcon className="text-amber-600" size={16} />
                    Communeye Software
                  </span>
                </td>
                <td className="p-0 text-right">
                  <a
                    className="text-amber-700 hover:text-amber-800 underline underline-offset-4"
                    href="https://www.instagram.com/communeye.software"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram Page
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-slate-300 bg-white p-5 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-black flex flex-row gap-2 items-center">
            <Star className="text-amber-300" /> MyProgressList
          </h2>
          <p className="text-sm text-gray-700 text-justify wrap-break-word">
            This project was inspired by a project previously made by the
            developer's batchmates in Don Bosco Technical College as part of the
            BS Information Technology academic curriculum, specifically on the
            third year of their study.
          </p>
          <p className="mt-2 text-sm text-gray-700 text-justify wrap-break-word">
            Migo, as well as Communeye Software, would like to give credit to
            the group in charge of the development of that project.
          </p>
          <table className="mt-2 w-full table-fixed text-sm text-gray-700 border-separate border-spacing-y-2">
            <tbody>
              <tr>
                <td className="p-0 w-1/2 font-bold text-black">Lance Kennedy Nafarrete</td>
                <td className="p-0 w-1/2 text-right">
                  Team Lead · Frontend Dev · UI/UX Design · Database Architect
                </td>
              </tr>
              <tr>
                <td className="p-0 w-1/2 font-bold text-black">Isaiah Wayne Foz</td>
                <td className="p-0 text-right">
                  Backend Dev · Flex Dev
                </td>
              </tr>
              <tr>
                <td className="p-0 w-1/2 font-bold text-black">Joeren Formento</td>
                <td className="p-0 w-1/2 text-right">Documentation</td>
              </tr>
              <tr>
                <td className="p-0 font-bold text-black">
                  Keith Morgan San Andres
                </td>
                <td className="p-0 w-1/2 text-right">QA / Consultant</td>
              </tr>
              <tr>
                <td className="p-0 w-1/2 font-bold text-black">Stephen Menguito</td>
                <td className="p-0 w-1/2 text-right">
                  Dailies Dev · Relax Engineer
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { TMaterialType } from "@/types/Materials";
import CreateForm from "./CreateForm";
import { AsyncParams } from "@/types/Params";

type TProps = AsyncParams<{}, { type: TMaterialType }>

export default async function LibraryCreate({ searchParams }: TProps) {
  const searchParamsRes = await searchParams;
  return (
    <main>
      <CreateForm defaultType={searchParamsRes.type} />
    </main>
  );
}
import Dashboard from "@/components/Dashboard";
import { getDocumentsAction } from "@/app/actions/documents.actions";

export default async function Page() {
  // Call the Server Action to fetch initial data on the server!
  const initialDocuments = await getDocumentsAction();

  return (
    <Dashboard initialDocuments={initialDocuments} />
  );
}

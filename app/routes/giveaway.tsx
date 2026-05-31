import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import {
  parseExcel,
  pickWinner,
  type Participant,
} from "~/utils/giveaway.server";

type ActionData = {
  error?: string;
  participants?: Participant[];
  winner?: Participant | null;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file)
    return json<ActionData>({ error: "No file uploaded" }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const participants = parseExcel(buffer);
    const winner = pickWinner(participants);

    return json<ActionData>({ participants, winner });
  } catch (error: any) {
    return json<ActionData>({ error: error.message }, { status: 400 });
  }
}

export default function GiveawayPage() {
  const data = useActionData<ActionData>();

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold p-4 border-b border-gray-700">
        Giveaway
      </h1>

      <div className="flex flex-1">
        {/* Left Column (Table) */}
        <div className="w-1/2 p-4 border-r border-gray-700">
          <Form method="post" encType="multipart/form-data" className="mb-4">
            <input
              type="file"
              name="file"
              accept=".xlsx"
              className="mb-2 text-gray-100"
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
            >
              Pick Winner
            </button>
          </Form>

          {data?.error && (
            <div className="bg-red-800 text-red-200 p-2 mb-4 rounded">
              {data.error}
            </div>
          )}

          {data?.participants && data.participants.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Participants</h2>
              <table className="w-full border border-gray-700 text-left">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-700 px-2 py-1">Name</th>
                    <th className="border border-gray-700 px-2 py-1">
                      Tickets
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.participants.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-800">
                      <td className="border border-gray-700 px-2 py-1">
                        {p.name}
                      </td>
                      <td className="border border-gray-700 px-2 py-1">
                        {p.tickets}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Center Column (Winner) */}
        <div className="flex flex-1 flex-col items-center p-6">
          {data?.winner && (
            <div className="w-full max-w-md p-6 bg-green-900 text-green-200 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">🎉</div>
              <div className="text-2xl font-bold">{data.winner.name} Wins!</div>
              <div className="text-lg mt-2">Tickets: {data.winner.tickets}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

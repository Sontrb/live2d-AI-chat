import {
  useBackendEndpoint,
  useOpenaiApikey,
  useOpenaiEndpoint,
  useOpenaiModelName,
  useUseBackendLLM,
} from "../models/appstore";

export default function Setting() {
  const [backendEndpoint, setBackendEndpoint] = useBackendEndpoint();
  const [useBackendLLM, setUseBackendLLM] = useUseBackendLLM();
  const [openaiEndpoint, setOpenaiEndpoint] = useOpenaiEndpoint();
  const [openaiApikey, setOpenaiApikey] = useOpenaiApikey();
  const [openaiModelName, setOpenaiModelName] = useOpenaiModelName();

  return (
    <div>
      <h1>Setting:</h1>
      <form>
        <label>
          backend Endpoint:
          <input
            type="text"
            value={backendEndpoint}
            onChange={(e) => setBackendEndpoint(e.target.value)}
          />
        </label>
        <br />
        <label>
          ues backend LLM?:
          <input
            type="checkbox"
            checked={useBackendLLM}
            onChange={(e) => setUseBackendLLM(e.target.checked)}
          />
        </label>
        <br />
        <label>
          OpenAI Endpoint:
          <input
            type="text"
            value={openaiEndpoint}
            onChange={(e) => setOpenaiEndpoint(e.target.value)}
          />
        </label>
        <br />
        <label>
          OpenAI API Key:
          <input
            type="text"
            value={openaiApikey}
            onChange={(e) => setOpenaiApikey(e.target.value)}
          />
        </label>
        <br />
        <label>
          OpenAI model name:
          <input
            type="text"
            value={openaiModelName}
            onChange={(e) => setOpenaiModelName(e.target.value)}
          />
        </label>
      </form>
    </div>
  );
}

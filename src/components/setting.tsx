import {
  useBackendEndpoint,
  useOpenaiApikey,
  useOpenaiEndpoint,
  useOpenaiModelName,
  useUseBackendLLM,
  useUseWebLLM,
} from "../models/appstore";

export default function Setting() {
  const [backendEndpoint, setBackendEndpoint] = useBackendEndpoint();
  const [useBackendLLM, setUseBackendLLM] = useUseBackendLLM();
  const [useWebLLM, setUseWebLLM] = useUseWebLLM();
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
            className="bg-gray-200"
            type="text"
            value={backendEndpoint}
            onChange={(e) => setBackendEndpoint(e.target.value)}
          />
        </label>
        <br />
        <label>
          use backend as llm proxy to avoid CORS?:
          <input
            className="bg-gray-200"
            type="checkbox"
            checked={useBackendLLM}
            onChange={(e) => {
              setUseBackendLLM(e.target.checked);
              if (e.target.checked) setUseWebLLM(false);
            }}
          />
        </label>
        <br />
        {!useBackendLLM && (
          <label>
            use webLLM
            <input
              className="bg-gray-200"
              type="checkbox"
              checked={useWebLLM}
              onChange={(e) => setUseWebLLM(e.target.checked)}
            />
          </label>
        )}

        {!useBackendLLM && !useWebLLM && (
          <>
            <br />
            <label>
              OpenAI Endpoint:
              <input
                className="bg-gray-200"
                type="text"
                value={openaiEndpoint}
                onChange={(e) => setOpenaiEndpoint(e.target.value)}
              />
            </label>
          </>
        )}
        <br />
        <label>
          OpenAI API Key:
          <input
            className="bg-gray-200"
            type="text"
            value={openaiApikey}
            onChange={(e) => setOpenaiApikey(e.target.value)}
          />
        </label>
        <br />
        {!useWebLLM && (
          <label>
            OpenAI model name:
            <input
              className="bg-gray-200"
              type="text"
              value={openaiModelName}
              onChange={(e) => setOpenaiModelName(e.target.value)}
            />
          </label>
        )}
      </form>
    </div>
  );
}

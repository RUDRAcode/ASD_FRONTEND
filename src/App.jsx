import { useEffect, useRef, useState } from "react";

const MODELS = [
  { value: "model-1", name: "ResNet18",     tag: "Baseline" },
  { value: "model-2", name: "DenseNet",     tag: "Dense"    },
  { value: "model-3", name: "EfficientNet", tag: "Lite"     },
];

export default function App() {
  const [data, setData]       = useState({ image: null, model: "model-1" });
  const [output, setOutput]   = useState({ url: null, result: null });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!data.image) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(data.image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [data.image]);

  function handleInput(e) {
    const name  = e.target.name;
    const value = name === "image" ? e.target.files[0] : e.target.value;
    setData(prev => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!data.image) { setError("No image selected."); return; }
    setLoading(true); setError(""); setOutput({ url: "", result: "" });

    try {
      const formData = new FormData();
      formData.append("file", data.image);
      formData.append("model_name", data.model);

      const res = await fetch("http://127.0.0.1:8000/predict/", { method: "POST", body: formData });
      if (!res.ok) throw new Error((await res.text()) || "Server error");

      const result = await res.json();
      if (!result.images) throw new Error("Invalid response from server");

      setOutput({
        url:    `data:image/jpeg;base64,${result.images}`,
        result: result.result,
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-mono grid grid-cols-1 md:grid-cols-2">

      {/* LEFT PANEL */}
      <div className="flex flex-col justify-between p-10 md:border-r border-stone-200">

        <span className="text-[10px] tracking-[0.22em] uppercase text-stone-400 font-sans font-semibold">
          Vision / Classifier
        </span>

        <div className="flex-1 flex items-center justify-center my-10">
          <div className="relative w-full max-w-sm aspect-square border border-stone-200 bg-stone-100 overflow-hidden">
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-stone-900 z-10" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-stone-900 z-10" />
            {previewUrl ? (
              <img ref={imageRef} src={previewUrl} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-stone-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="1"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span className="text-[10px] tracking-[0.14em] uppercase">No image</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-stone-200 pt-6">
          <p className="text-[10px] tracking-[0.18em] uppercase text-stone-400 mb-2">Classification result</p>
          <p className={`font-sans font-extrabold text-3xl tracking-tight leading-none ${output.result ? "text-stone-900" : "text-stone-200"}`}>
            {output.result || "—"}
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col p-10">

        <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 pb-4 border-b border-stone-200 mb-8">
          Configure &amp; Run
        </p>

        {error && (
          <div className="text-[11px] tracking-wide text-red-600 border border-red-400 px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* File input */}
        <div className="mb-8">
          <span className="block text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-2">Input image</span>
          <label className="group relative cursor-pointer block">
            <input type="file" name="image" accept="image/*" onChange={handleInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            <div className="border border-dashed border-stone-300 group-hover:border-stone-900 group-hover:bg-stone-100 transition-colors flex items-center gap-4 px-5 py-5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                className="text-stone-400 group-hover:text-stone-900 transition-colors shrink-0">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="text-[12px] text-stone-500 group-hover:text-stone-900 transition-colors truncate">
                {data.image ? data.image.name : "Click to upload"}
              </span>
            </div>
          </label>
        </div>

        {/* Model select */}
        <div className="mb-8">
          <span className="block text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-2">Model</span>
          <div className="grid grid-cols-3 gap-2">
            {MODELS.map(m => (
              <label key={m.value} className="cursor-pointer">
                <input type="radio" name="model" value={m.value}
                  checked={data.model === m.value}
                  onChange={handleInput}
                  className="sr-only" />
                <div className={`border px-2 py-3 text-center transition-colors
                  ${data.model === m.value
                    ? "bg-stone-900 border-stone-900 text-stone-50"
                    : "border-stone-200 hover:border-stone-900 text-stone-900"}`}>
                  <span className="block text-[11px] font-medium tracking-wide">{m.name}</span>
                  <span className="block text-[9px] tracking-widest uppercase mt-0.5 text-stone-400">{m.tag}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Output image */}
        <div className="mb-8">
          <span className="block text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-2">Output image</span>
          <div className="aspect-video border border-stone-200 bg-stone-100 overflow-hidden flex justify-center items-center">
            {output.url ? (
              <img src={output.url} alt="result" className="w-1/2 h-4/5 object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] tracking-[0.15em] uppercase text-stone-300">
                Awaiting inference
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-auto flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-stone-900 text-stone-50 text-[11px] tracking-[0.2em] uppercase px-10 py-4 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-mono"
          >
            {loading ? "Running…" : "Run inference"}
          </button>
          {loading && (
            <svg className="w-4 h-4 animate-spin text-stone-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"
                strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
            </svg>
          )}
        </div>

      </div>
    </div>
  );
}
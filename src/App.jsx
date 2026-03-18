import { useEffect, useRef, useState } from "react";

function App() {
  const [data, setData] = useState({ image: null, model: "model-1" });
  const [output, setOutput] = useState({url:null,result:null});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const imageRef = useRef(null);

  useEffect(() => {
    if (!data.image) return;

    const url = URL.createObjectURL(data.image);

    if (imageRef.current) {
      imageRef.current.src = url;
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [data.image]);

  function handleInput(e) {
    const name = e.target.name;
    const value = name === "image" ? e.target.files[0] : e.target.value;

    setData((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!data.image) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError("");
    setOutput({url:'',result:''});

    try {
      const formData = new FormData();
      formData.append("file", data.image);
      formData.append("model_name", data.model);

      const res = await fetch("https://asd-backend-9gt5.onrender.com/predict/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Server error");
      }

      const result = await res.json();

      if (!result.images) {
        throw new Error("Invalid response from server");
      }
      const imgs = `data:image/jpeg;base64,${result.images}`;
      const value=result.result

      setOutput({result:value,url:imgs});
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="w-full h-screen flex flex-col items-center gap-4 p-4">
      {error && (
        <div className="text-red-500 border border-red-500 p-2 rounded">
          {error}
        </div>
      )}

      {data.image && (
        <div className="w-56 h-56">
          <img
            ref={imageRef}
            className="w-full h-full object-cover"
            alt="preview"
          />
        </div>
      )}
      {loading && (
        <div>
          <svg
            aria-hidden="true"
            class="w-8 h-8 text-neutral-tertiary animate-spin fill-brand mt-3"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      )}
      {output.url && <img src={output.url} className="w-56 h-56 object-cover"/>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label>Choose an image:</label>
        <input type="file" name="image" onChange={handleInput} />

        <label>
          Choose model:
          <select
            value={data.model}
            name="model"
            onChange={handleInput}
            className="p-2 border-2 rounded-xl ml-2"
          >
            <option value="model-1">ResNet18</option>
            <option value="model-2">DenseNet</option>
            <option value="model-3">Efficient-Net</option>
          </select>
        </label>
        <span>Output: {output.result ? output.result: "..."}</span>
        <button
          type="submit"
          disabled={loading}
          className="border-2 p-2 rounded-2xl ml-2 w-24 h-12"
        >
          {loading ? "..." : "Submit"}
        </button>
      </form>
    </section>
  );
}

export default App;
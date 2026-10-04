async function list() {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6LNJ79qOvB3QVwO28TfaGswGZiY66S7geeFzD70vZatrQ");
  const data = await res.json();
  const embedModels = data.models.filter(m => m.supportedGenerationMethods?.includes("embedContent"));
  console.log(embedModels.map(m => m.name));
}
list();

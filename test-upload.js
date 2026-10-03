const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  const blob = new Blob(["%PDF-1.4 mock content"], { type: "application/pdf" });
  formData.append("file", blob, "test.pdf");

  try {
    console.log("Sending request...");
    const response = await fetch("http://localhost:3000/api/documents", {
      method: "POST",
      body: formData,
    });
    
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response text:", text);
    
    if (text) {
      console.log("Parsed JSON:", JSON.parse(text));
    } else {
      console.log("Empty body!");
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }
}

testUpload();

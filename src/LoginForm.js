import { useState } from "react";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist/webpack";

const data = [
  {
    number: 123456789,
    password: 1234,
  },
  {
    number: 8779442800,
    password: 2801,
  },
];

export default function LoginForm() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLogedIn] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [tableData, setTableData] = useState([]);

  const handleSubmit = () => {
    const user = data.find(
      (entry) =>
        entry.number === parseInt(phone) &&
        entry.password === parseInt(password)
    );
    if (user) {
      console.log(`Phone:${phone} Password:${password}`);
      setIsLogedIn(true);
    } else {
      alert("Incorrect username and Password");
      setPhone("");
      setPassword("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected File", file.name);
      setUploadedFile(file);
      setTableData([]);
    }
  };

  const handleReportClick = async () => {
    if (!uploadedFile) return;

    const fileType = uploadedFile.type;

    if (fileType === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        const textData = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const textItems = content.items.map((item) => item.str);
          textData.push(textItems);
        }

        setTableData(textData);
      };
      reader.readAsArrayBuffer(uploadedFile);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileType === "application/vnd.ms-excel"
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // 2D array
        setTableData(json);
      };
      reader.readAsArrayBuffer(uploadedFile);
    } else {
      alert("Only PDF or Excel files are supported for report.");
    }
  };

  return (
    <div className="login-container">
      {!isLoggedIn ? (
        <div className="login-box">
          <h1 className="logo-text">LOGIN</h1>

          <label className="input-label">Enter Your Mobile Number</label>
          <input
            type="text"
            placeholder="+91 |  Mobile Number"
            className="mobile-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="mobile-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="continue-button" onClick={handleSubmit}>
            CONTINUE
          </button>
        </div>
      ) : (
        <div className="post-login-button">
          <label
            className="upload-btn"
            style={{ display: "inline-block", cursor: "pointer" }}
          >
            Upload File
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".xlsx,.xls,.pdf"
            />
          </label>
          <button className="continue-button" onClick={handleReportClick}>
            Report
          </button>
          {tableData.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Parsed Report</h3>
              <table border="1" cellPadding="5">
                <tbody>
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

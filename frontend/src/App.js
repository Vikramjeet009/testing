import React, { useState } from "react";
import axios from "axios";

function App() {
  // const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState(null);
  const [showDownloadBtn, setShowDownloadBtn] = useState(false);

  const uploadFile = (e) => {
    e.preventDefault();
    console.log("files : ", files);

    const filesData = new FormData(); // use FormData else it will give data too long error
    for (const key of Object.keys(files)) {
      filesData.append("file", files[key]);
    }
    // console.log("filesData : ", filesData);

    // const data = {
    //   filesData,
    //   folderName,
    // };
    // console.log("data : ", data);
    // setShowDownloadBtn(true);

    axios
      .post("http://localhost:5000/user/upload-image", filesData)
      .then((res) => {
        setShowDownloadBtn(true);
        console.log("res : ", res);
      })
      .catch((err) => console.log("err : ", err));
  };

  const downloadFile = (e) => {
    e.preventDefault();

    let fileNames = [];
    for (const key of Object.keys(files)) {
      fileNames.push(files[key].name);
    }
    console.log(fileNames);

    axios
      .post("http://localhost:5000/user/download-image", fileNames)
      .then((res) => {
        setShowDownloadBtn(false);
        console.log("res : ", res);
      })
      .catch((err) => console.log("err : ", err));
  };

  return (
    <div className="container">
      <div className="row d-flex flex-column align-items-center justify-content-center">
        <form className="form-control w-50" encType="multipart/form-data">
          {/* <input
            type="text"
            className="form-control mb-2"
            placeholder="Enter AWS folder name"
            onChange={(e) => setFolderName(e.target.value)}
            required
          /> */}
          <input
            type="file"
            className="form-control mb-2"
            name="file"
            multiple
            required
            onChange={(e) => setFiles(e.target.files)}
          />
          <input
            type="submit"
            onClick={uploadFile}
            className="btn btn-success form-control"
          />
        </form>

        {showDownloadBtn && (
          <form className="form-control w-50 mt-2">
            <input
              type="submit"
              onClick={downloadFile}
              value="Download"
              className="btn btn-success form-control"
            />
          </form>
        )}
      </div>
    </div>
  );
}

export default App;

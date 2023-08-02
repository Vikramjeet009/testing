import React, { useEffect, useState } from "react";
import axios from "axios";
import { imagefrombuffer } from "imagefrombuffer"; 

function App() {
    // const [folderName, setFolderName] = useState("");
    const [files, setFiles] = useState(null);
    const [showDownloadBtn, setShowDownloadBtn] = useState(false);
    // const [img, setImg] = useState(null);

    // useEffect(() => {
    //     axios
    //         .get(
    //             "http://localhost:5000/user/resize-image/?name=70348e05afb76c7902fa85700&height=100&width=100"
    //         )
    //         .then((res) => {
    //           console.log(res)
    //           // setImg(res.data.data);
    //           setImg(res.data);
    //         })
    //         .catch((error) => console.log(error));
    // }, []);

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
            <img src={`http://localhost:5000/user/resize-image/?name=70348e05afb76c7902fa85700&height=100&width=100`} alt="" />
            {/* <img src={imagefrombuffer({...img})} alt="" /> */}
            {/* <img src={img} alt="" /> */}
            {/* <img src="data:image/png;base64,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" alt="" /> */}

            <div className="row d-flex flex-column align-items-center justify-content-center">
                <form
                    className="form-control w-50"
                    encType="multipart/form-data"
                >
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

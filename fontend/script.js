import { woffId, lambdaUrl } from './params.js'
const addKintoneRecord = async(productName, address, table, tbSum, file) => {
    $('#spinner').removeClass();
    let rec = {
        "現場名": { 'value': productName },
        // "住所": { 'value': address },
        "WOFFテスト用テーブル": { 'value': table },
    };
    if ($('#key-file').val()) {
        rec["画像"] = {
            'value': [{
                "fileKey": $('#key-file').val(),
            }]
        };
    }
    console.log(rec)
    axios.post(lambdaUrl, rec)
        .then((res) => {
            deleteAllPhotos()
            console.log(res)

            let msg = "登録しました。\n" + "現場名: " + productName + "\n" + "住所: " + address + "\n" + "総合計: " + tbSum + "\n";
            // send message
            woff.sendMessage({ 'content': msg }).then(() => {
                // Success
                console.log("message sent: " + msg)
                $('#spinner').addClass('none-spinner');
                woff.closeWindow();
            }).catch((err) => {
                $('#spinner').addClass('none-spinner');
                console.log(err)
                window.alert(err);
            });
        })
        .catch((err) => {
            console.log("error")
            console.log(err);
        });
}

/**
 * Get profile
 */
const getProfile = () => {
    return new Promise((resolve, reject) => {
        // Get profile
        woff.getProfile().then((profile) => {
            // Success
            console.log(profile)
            resolve(profile)
        }).catch((err) => {
            // Error
            console.log(err)
            reject(err)
        });
    });
}

/**
 * Register event handlers for the buttons displayed in the app
 */
const registerButtonHandlers = async(userId) => {
    document.getElementById('submit').addEventListener('click', async function() {
        let productName = document.getElementById('productName').value;
        let address = document.getElementById('address').value;
        // file
        // let fileInput = document.getElementById('file');
        // let file = fileInput.files[0];
        let table = await getArr();
        // table
        let tbSum = document.getElementById('tb-sum').value;

        addKintoneRecord(productName, address, table, tbSum, file)

        return
    })
}
const getArr = async() => {
    var rows = document.querySelectorAll('#table .row.mt-2');
    var data = [];
    rows.forEach(function(row) {
        let check = [];
        var checkboxes = row.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                check.push(checkbox.value);
            }
        });
        data.push({
            "value": {
                '商品名': { "value": row.querySelector('input[name="tb-lookup"]').value },
                // '商品コード': { "value": row.querySelector('input[name="tb-lookup-copy"]').value },
                '在庫区分': { "value": check },
                '数量': { "value": row.querySelector('input[name="number"]').value },
                '単価': { "value": row.querySelector('input[name="price"]').value },
                // '合計': { "value": row.querySelector('input[name="total"]').value }
            }
        });
    });
    return data;
};
const woffInit = () => {
    // Initialize WOFF
    woff.init({ woffId: woffId })
        .then(() => {
            if (!woff.isLoggedIn()) {
                woff.login()
                woffInit()
            }
            // Success
            // Get and show user profile
            getProfile()
                .then((profile) => {
                    // Button handler
                    registerButtonHandlers(profile.userId);
                })
                .catch((err) => {
                    window.alert(err);
                });;
        })
        .catch((err) => {
            // Error
            //window.alert(err);
            console.error(err)
        });
}

// On load
window.addEventListener('load', () => {
    // console.log(woffId)
    woffInit()
    getRecord_5232();
    getRecord_5936();
});
const getRecord_5232 = async() => {
    axios.get(lambdaUrl + "?id=5232")
        .then((res) => {
            const records = res.data.records;
            let html;
            records.forEach((record, index) => {
                console.log(record);
                html += `<tr>
                    <td>${record.現場名.value}</td>
                    <td>${record.現場住所.value}</td>
                    <td><button onclick="selective('${record.現場名.value}','${record.現場住所.value}')">select</button></td>
                </tr>`;
            });
            $("#tb_1").append(html);
            // $(".spinner-grow_1")
        })
        .catch((err) => {
            console.log("error")
            console.log(err);
        });
};
const getRecord_5936 = async() => {
    axios.get(lambdaUrl + "?id=5936")
        .then((res) => {
            const records = res.data.records;
            let html;
            console.log(records);
            records.forEach((record) => {
                html += `<tr>
                <td>${record.商品名.value}</td>
                <td><button onclick="selective_2('${record.商品名.value}','${record.商品コード.value}')">select</button></td>
            </tr>`;
            });
            $("#tb_2").append(html);
        })
        .catch((err) => {
            console.log("error")
            console.log(err);
        });
};
$('#file').change(async function() {
    const urlS3 = await addFile();
    console.log(urlS3);
    const formData = {
        "path": urlS3.path,
        "fileName": urlS3.fileName
    }
    axios.put(lambdaUrl, formData, {
            headers: {}
        })
        .then(response => {
            $("#key-file").val(response.data);
        })
        .catch(error => {
            console.error(error);
        });
});


// S3
var s3Name = "line-works-tes";
var bucketRegion = "us-east-1";
var accessKeyID = "";
var secretAccessKey = "";

AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.Credentials(accessKeyID, secretAccessKey)
});

var s3 = new AWS.S3();
// function
function connect(bucketName) {
    s3.listObjectsV2({ Bucket: bucketName }, (err, data) => {
        console.log(data);
        console.log(err);
    });
}

async function addFile() {
    var folderName = "public";
    var files = document.getElementById("file").files;
    if (!files.length) {
        return alert("Please choose a file to upload first.");
    }
    var file = files[0];
    var fileName = Date.now() + "_" + file.name;
    var albumPhotosKey = folderName + "/";
    var photoKey = albumPhotosKey + fileName;
    var upload = new AWS.S3.ManagedUpload({
        params: {
            Bucket: "line-works-tes",
            Key: photoKey,
            Body: file,
        },
    });
    var promise = upload.promise();

    try {
        var data = await promise;
        return {
            "path": `https://${s3Name}.s3.amazonaws.com/${folderName}/${fileName}`,
            "fileName": fileName
        }
    } catch (err) {
        alert("There was an error uploading your photo: ", err.message);
    }
}

function deleteAllPhotos() {
    var params = {
        Bucket: "line-works-tes",
        Prefix: "public/",
    };

    s3.listObjectsV2(params, function(err, data) {
        if (err) {
            return alert("There was an error listing photos: ", err.message);
        }
        var deleteParams = {
            Bucket: "line-works-tes",
            Delete: { Objects: [] }
        };

        data.Contents.forEach(function(photo) {
            if (photo.Key == "public/") return;
            deleteParams.Delete.Objects.push({ Key: photo.Key });
        });

        if (deleteParams.Delete.Objects.length > 0) {
            s3.deleteObjects(deleteParams, function(err, data) {
                if (err) {
                    // return alert("There was an error deleting your photos: ", err.message);
                    console.err(err)
                }
            });
        } else {
            alert("There are no photos to delete.");
        }
    });
}



// connect("line-works-tes")
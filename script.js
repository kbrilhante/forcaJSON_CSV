function inicialize() {
    document.querySelector('#inpFile').onchange = submit;
    document.querySelector('#txtOutputJSON').oninput = () => {
        createCheck('btnCheckJSON', '#controlButtonsJSON', changeJSON);
    };
    document.querySelector('#txtOutputCSV').oninput = () => {
        createCheck('btnCheckCSV', '#controlButtonsCSV', changeCSV);
    };
}

function submit(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        getFile(file.type, reader.result)
    };
    reader.readAsText(file);
}

function getFile(type, result) {
    let object;    
    if (type == 'application/json') {
        object = handleJSON(result);
    } else if (type == 'text/csv') {
        object = handleCSV(result);
    }
    setOutput(object)
}

function createCheck(id, groupId, callback){
    let btn = document.getElementById(id);
    if (!btn) {
        const group = document.querySelector(groupId);
        btn = setButton('fa-solid fa-check');
        btn.id = id;
        btn.onclick = callback;
        group.prepend(btn);
    }
}

function changeJSON() {
    const btnCheck = document.getElementById('btnCheckJSON');
    const data = document.getElementById('txtOutputJSON');
    btnCheck.remove();
    const object = handleJSON(data.value);
    if (object) {
        console.log(object);
        setOutput(object);
    }
}

function changeCSV() {
    const btnCheck = document.getElementById('btnCheckCSV');
    const data = document.getElementById('txtOutputCSV');
    btnCheck.remove();
    const object = handleCSV(data.value);
    setOutput(object);
}

function setOutput(object) {
    removeDuplicates(object);
    newJSON(object);
    newCSV(object);
}

function handleJSON(data) {
    try {
        const object = JSON.parse(data);
        return object;
    } catch (error) {
        console.error(error);
        alert("Falha na conversão dos dados")
    }
    return false;
}

function handleCSV(data) {
    data = data.split('\n')
    const object = {};
    const failLines = [];
    for (let i = 1; i < data.length; i++) {
        let line = data[i];
        if (line) {
            line = line.split(",");
        }
        if (line.length == 3) {
            console.log(line)
            const key = line[1].trim();
            const element = line[2];
            if (!Object.keys(object).includes(key)) object[key] = [];
            object[key].push(element);
        } else if (line.length > 0) {
            failLines.push(line);
        }
    }
    if (failLines.length) {
        alert("Some lines were not added to csv check commas and try again")
        console.error("These lines were not added to the file because of an error:\n" + failLines.join("\n"));
    }
    return object;
}

function removeDuplicates(object) {
    // also change it all to upper case and trims spaces
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            const array = object[key];
            const new_array = [];
            for (const element of array) {
                let word = element.toUpperCase().trim()
                if (!new_array.includes(word)) new_array.push(word)
            }
            object[key] = new_array;
        }
    }
}

function newJSON(object) {
    let lines = [];
    let strJSON = '\{\n';
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            const element = object[key];
            let line = '    \"' + key + '\": \[\n        \"';
            line += element.join('", "');
            line += '\"\n    \]';
            lines.push(line)
        }
    }
    strJSON += lines.join(',\n');
    strJSON += '\}';
    document.querySelector('#txtOutputJSON').value = strJSON;
    buttonGroup('controlButtonsJSON', strJSON, 'application/json');
}

function newCSV(object) {
    const lines = ['id, categoria, palavra']
    let id = 1;
    for (const categoria in object) {
        if (Object.prototype.hasOwnProperty.call(object, categoria)) {
            const element = object[categoria];
            for (const palavra of element) {
               let line = [];
               line.push(id++);
               line.push(categoria);
               line.push(palavra)
               lines.push(line.join(','));
            }
        }
    }
    const strCSV = lines.join('\n');
    document.querySelector('#txtOutputCSV').value = strCSV;
    buttonGroup('controlButtonsCSV', strCSV, 'text/csv');
}

function buttonGroup(containerId, text, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const btnCpy = setButton('fa-solid fa-copy');
    btnCpy.onclick = () => {
        copyText(text);
    }
    const btnDown = setButton('fa-solid fa-download');
    btnDown.onclick = () => {
        download(text, type);
    }
    container.appendChild(btnCpy);
    container.appendChild(btnDown);
}

function setButton(icon) {
    const btn = document.createElement('button');
    const i = document.createElement('i');
    btn.className = 'btn btn-secondary';
    i.className = icon;
    btn.appendChild(i);
    return btn;
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(
        () => {
            console.log('Copiado com sucesso');
            alert('Copiado com sucesso');
        },
        err => {
            console.error(err);
        }
    )
}

function download(text, type) {
    const blob = new Blob([text], {type: type});
    const ext = type.split('/')[1];
    const fileName = 'download.' + ext;
    const downLink = document.createElement('a');
    downLink.download = fileName;
    if (webkitURL != null) {
        downLink.href = webkitURL.createObjectURL(blob);
    } else {
        downLink.href = URL.createObjectURL(blob);
        downLink.onclick = destroyClickedElement;
        downLink.style.display = 'none';
        document.body.appendChild(downLink);
    }
    downLink.click();
}

inicialize()
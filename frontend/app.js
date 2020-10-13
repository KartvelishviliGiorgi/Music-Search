const searchField = document.getElementById('search-field');

const url = 'http://localhost:3000/';
let data = [];

const loadData = async url => {
    const response = await fetch(url);

    data = await response.json();

    searchField.disabled = false;
}

loadData(url);

const changeAudioButton = (element, status) => {
    if(status){
        element.classList.remove('fa-play-circle');
        element.classList.add('fa-pause-circle');
    } else {
        element.classList.remove('fa-pause-circle');
        element.classList.add('fa-play-circle');        
    }
}

const playAudio = audio => {
    let allAudio = document.getElementsByTagName('audio');

    Array.prototype.forEach.call(allAudio, item => {
        if(!item.paused) {
            let audioButton = document.getElementById('button-' + item.id).firstChild;
            item.pause();
            changeAudioButton(audioButton, 0);
        }
    });
    
    audio.play();
}

const audioButton = audioId => {
    let audio = document.getElementById('audio-' + audioId);
    let audioButton = document.getElementById('button-audio-' + audioId).firstChild;

    if(audio.paused) {
        playAudio(audio);
        changeAudioButton(audioButton, 1);
    } else {
        audio.pause();
        changeAudioButton(audioButton, 0);
    }
}

const showKeywordsList = status => {
    const keyWordsList = document.getElementById('search-keywords');

    status ? keyWordsList.style.display = 'flex' : keyWordsList.style.display = 'none';
}

const clearElementContent = element => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

const createTrackItem = (item) => {
    const contentContainer = document.getElementById('content');
    
    const element = document.createElement('div');
    element.setAttribute('class', 'album-card');

    const content = `
            <div class="album-header">
                <div class="album-image">
                    <img src="${data.alben[item.albumID].albumCoverSmall}" alt="">
                </div>
                <div class="album-name">${item.albumName}</div>
                <div class="cue-name">${item.cueName}</div>
                <div class="audio">
                    <audio id="audio-${item.cueID}">
                        <source src="${item.fullLengthPreview}" type="audio/mpeg">
                    </audio>
                    <button id="button-audio-${item.cueID}" onclick="audioButton('${item.cueID}')" type="button"><i class="fas fa-play-circle"></i></button>
                </div>
            </div>`;
    element.innerHTML = content;

    contentContainer.appendChild(element);
}

const loadAlbum = albumId => {
    const cueData = Object.entries(data.cueData);

    let tracks = cueData.filter(item => {
        return item[1].albumID == albumId;
    });

    tracks.forEach(item => createTrackItem(item[1]))
}

const createListItem = (parentElement, elementType, content, itemId) => {
    let listItem = document.createElement("a");
    listItem.innerHTML = content;
    parentElement.appendChild(listItem);

    const contentContainer = document.getElementById('content');
    clearElementContent(contentContainer);

    if(elementType == 'album') {
        listItem.onclick = () => {
            loadAlbum(itemId);
            showKeywordsList(0);
            clearElementContent(albumList);
            clearElementContent(trackList);
            searchField.value = content;
        }
    }
    if(elementType == 'track') {
        const item = data.cueData[itemId];
        
        listItem.onclick = () => {
            console.log(item)
            createTrackItem(item);
            showKeywordsList(0);
            clearElementContent(albumList);
            clearElementContent(trackList);
            searchField.value = content;
        }
    }
}

let albumList;
let trackList;

const keywordSearch = keyword => {
    albumList = document.getElementById('album-keywords');
    trackList = document.getElementById('track-keywords');

    clearElementContent(albumList);
    clearElementContent(trackList);

    showKeywordsList(0);

    if(keyword) {
        const regex = new RegExp(`^${keyword}`, 'gi');

        const albums = Object.entries(data.alben);
        const tracks = Object.entries(data.cueData);

        let albumsName = albums.filter(item => {
            return item[1].albumName.match(regex);
        });

        let tracksNames = tracks.filter(item => {
            return item[1].cueName.match(regex);
        });

        if(albumsName || tracksNames) {
            showKeywordsList(1);

            albumsName.slice(0, 10).forEach(album => {
                createListItem(albumList, 'album', album[1].albumName, album[1].albumID);
            });

            tracksNames.slice(0, 10).forEach(track => {
                createListItem(trackList, 'track', track[1].cueName, track[1].cueID);
            });
        }

    }
}

searchField.addEventListener('input', () => keywordSearch(searchField.value));

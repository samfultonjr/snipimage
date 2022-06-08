const MAX_UPLOAD_SIZE = 30000000; // 30mb
const storage = firebase.storage();
const db = firebase.firestore();

let isPrivate = false;
let isAnonymous = false;

document.querySelector('.isPrivate-switch .slider').addEventListener('click', () => isPrivate = isPrivate ? false : true);


let automated = 0;

let stickAnonToggle = () => {
    try {
        let anonymous = firebase.auth().currentUser.isAnonymous;
        if(anonymous && isAnonymous !== true) {
            document.querySelector('.isAnonymous-switch .slider').click();
            automated++;
            isAnonymous = true;

            if(automated > 1) {
                prompt.add({
                    message: 'Login or Sign Up to post non-anonymously.', 
                    level: 1, 
                    duration: 3000
                });
            }
            // document.querySelector('.isAnonymous-switch .slider').classList.add('disabled-switch');
        }
    } catch(err) {
        console.log(err);
    }
}



document.querySelector('.isAnonymous-switch .slider').addEventListener('click', () => {
    isAnonymous = isAnonymous ? false : true;
    stickAnonToggle();
    console.log('Anonymous: ' + isAnonymous);

});



setTimeout(() => {
    stickAnonToggle();
}, 1000);

setTimeout(() => {
    stickAnonToggle();
}, 5000);

class Upload {
    constructor() {
        this.files = [];
        this.init();
    }

    // Add new file to upload
    addFile  (file) {
        
        if(!(file.type.match('image.*'))) {
            prompt.add({
                message: 'Only images supported', 
                level: 2, 
                duration: 3000
            });
            return;
        }

        if(file.size > MAX_UPLOAD_SIZE) {
            prompt.add({
                message: 'Files larger than 30mb are not supported', 
                level: 2, 
                duration: 3000
            });
            return;
        }

        if(file.size + this.totalSize() > MAX_UPLOAD_SIZE) {
            prompt.add({
                message: 'Total upload size cannot exceed 30mb', 
                level: 2, 
                duration: 3000
            });
            return;
        }

        if(this.files.length >= 20) {
            prompt.add({
                message: 'Maximum of 20 files reached', 
                level: 2, 
                duration: 3000
            });
            return;
        }
        file.isVideo = file.type.match('video.*');
        file.id = this.uuid();
        this.files.push(file);
        // this.updateTotalSize();
    };

    deleteFile(id) {
        this.files = this.files.filter((file) => file.id !== id);
        // this.updateTotalSize();
        this.refreshPreviews();
    }


    // Get total size of all files
    totalSize ()  {
        return this.files.reduce((total, file) => {
            return total + file.size;
        }, 0);
    }

    // Set total size element
    updateTotalSize () {
        document.querySelector('.used-size').textContent = (this.totalSize() / 1000000).toFixed(3);
    }

    buttonLoading () {
       //  document.querySelector('.loading-button').classList.remove('hidden');
        document.querySelector('.submit-button').classList.add('disabled');

    }
    
    buttonDoneLoading () {
       //  document.querySelector('.loading-button').classList.add('hidden');
        document.querySelector('.submit-button').classList.remove('disabled');
    }

    // Generates UUID
    oldUUID () {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
          );
    }

    uuid () {
        const options = [1,2,3,4,5,6,7,8,9,'a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','k','K','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','x','X','y','Y','z','Z'];
        let uuid = '';
        for (let index = 0; index < 8; index++) {
            uuid += options[Math.floor(Math.random() * options.length)];
        }
        return uuid;
    }

    // Load file previews 
    async refreshPreviews () {
        const fileContainer = document.querySelector('.file-preview-container');

        const filePreviewEls = document.querySelectorAll('.file-preview');
        for (const filePreviewEl of filePreviewEls) {
            let foundMatchingFile = false;
            for (const file of this.files) {
                if(file.id === filePreviewEl.id) foundMatchingFile = true;
            }
            if(!foundMatchingFile) {
                console.log('Removed preview');
                filePreviewEl.parentNode.remove();
            }
        }

        const unAdded = this.files.filter((file) => {
            const resp =  document.getElementById(file.id);
            if(resp == null) return true;
            return false;
        });
        for (const file of unAdded) {

            const fileType = file.isVideo ? 'video' : 'img';
            const fileElement = document.createElement(fileType);
            fileElement.playsInline = true;
            fileElement.id = file.id;
            fileElement.loop = true;
            fileElement.muted = true;
            fileElement.autoplay = true;
            fileElement.src = "./resources/loading.gif";
            
            fileElement.classList.add('file-preview');
            const DURL =  window.URL.createObjectURL(file);
            fileElement.src = DURL;

            const fileWrapperEl = document.createElement('div');
            fileWrapperEl.classList.add('file-wrapper');


            const removeButtonEl = document.createElement('figure');
            removeButtonEl.classList.add('remove-preview-button');
            removeButtonEl.textContent = 'x';


            fileElement.appendChild(removeButtonEl);

            fileWrapperEl.appendChild(fileElement);
            fileWrapperEl.appendChild(removeButtonEl);
            fileContainer.appendChild(fileWrapperEl);

            removeButtonEl.addEventListener('click', () => {
                this.deleteFile(fileElement.id);
            });
        }
    }

    async launch () {
        try {
            prompt.add({
                message: 'Uploading...', 
                level: 0, 
                duration: 30000
            });
        this.buttonLoading();
        const mediaIds = await this.uploadFiles();
        if(!mediaIds) {
            this.buttonDoneLoading();
            return;
        }
        const postId = await this.claimPost(mediaIds);
        if(!postId) {
            prompt.add({
                message: 'Failed to upload post information. Please try again.', 
                level: 2, 
                duration: 5000
            });
            this.buttonDoneLoading();
            return;
        }

        // success
        prompt.add({
            message: 'Uploaded!', 
            level: 1, 
            duration: 5000
        });

        // rdt('track', 'Custom', {
        //     "customEventName": "uploadPageSubmit",
        //     "transactionId": Date.now(),
        //     "value": postId
        // });

        window.location.href = `https://picbun.com/p/${postId}`;
        }
        catch(err) {
            this.buttonDoneLoading();
        }
    }

    async claimPost (mediaIds) {
        const title = document.querySelector('.title-input').value;
        const description = document.querySelector('.description-input').value;
        let userId;
        try {
            userId = await firebase.auth().currentUser.getIdToken();
        } catch (error) {
            try {
                await firebase.auth().signInAnonymously();
                userId = await firebase.auth().currentUser.getIdToken();
            } catch (err) {
                if(!postId) {
                    prompt.add({
                        message: 'Could not authenticate, please refresh and try again', 
                        level: 2, 
                        duration: 5000
                    });
                    return null;
                }
            }
        }
        try {
            const body = {
                title,
                description,
                mediaIds,
                userToken: userId,
                isPrivate,
                isAnonymous
            };
            const resp = await fetch('https://picbun.com/createPost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            // 
            const parsedResp = await resp.json();
            console.log(parsedResp);
            if(parsedResp.error) {
                throw new Error(parsedResp.error);
            }
            if(parsedResp.postId) {
                return parsedResp.postId;
            }
            throw new Error(`failed to get post id`);
        } catch (err) {
            console.log(err);
            prompt.add({message: `Error Uploading: ${err.message}`, level: 2, duration: 5000});
            return null;
        }
    }

    async getMediaDimension(file) {
        return new Promise((resolve, reject) => {
            const e = file.isVideo ? document.createElement('video') : document.createElement('img');
            if(file.isVideo) {
                e.addEventListener("loadeddata", (event)=> {
                    resolve({width: e.videoWidth, height: e.videoHeight});
                });
            }  else {
                e.onload = ()=> {
                    resolve({width: e.width, height: e.height});
                };
            }
            e.src = window.URL.createObjectURL(file);
        })

    }

    // async formDataUpload () {
    //     this.buttonLoading();
    //     try {
    //         const formData = new FormData();

    //         this.buttonDoneLoading();
    //     } catch (error) {
    //         prompt.add({message: `Failed to post: ${error}`, level: 2, duration: 5000});
    //         this.buttonDoneLoading();
    //     }
    //     this.buttonDoneLoading();
    // }

    // async up () {
    //     this.buttonLoading();
    //     try {
    //         const title = document.querySelector('.title-input').textContent;
    //         const description = document.querySelector('.description-input').textContent;
    //         const media = await this.encodeFiles();
    //         const userToken = await firebase.auth().currentUser.getIdToken();
    //         const body = {
    //             title,
    //             description,
    //             media,
    //             userToken,
    //             isPrivate: false
    //         };
    //         const formData = new FormData();
    //         for (const attrib of Object.keys(body)) {
    //             formData.set(attrib, body[attrib]);
    //         }
    //         const resp = await fetch('https://picbun.com/submit', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'multipart/form-data'
    //             },
    //             body: formData
    //         });
    //         
    //         const parsedResp = await resp.json();
    //         console.log(parsedResp);
    //         if(parsedResp.error) {
    //             throw new Error(`UPLOAD ERROR: ${parsedResp.error}`);
    //         }
    //         const {success, postId} = parsedResp;
    //         if(success) {
    //             window.location.href = `https://picbun.com/p/${postId}`;
    //             return;
    //         }
    //         prompt.add({message: `Failed to post: ${error}`, level: 2, duration: 5000});
    //         this.buttonDoneLoading();
    //     } catch (error) {
    //         prompt.add({message: `Failed to post: ${error}`, level: 2, duration: 5000});
    //         this.buttonDoneLoading();
    //     }
    //     this.buttonDoneLoading();
    // }

    // async encodeFiles () {
    //     const media = [];
    //     for (const file of this.files) {
    //         const {width, height} = await this.getMediaDimension(file);
    //         const contents = {
    //             file,
    //             isVideo: file.isVideo,
    //             name: file.name,
    //             customMetadata: {
    //                 type: file.type,
    //                 size: file.size,
    //                 height,
    //                 width,
    //             }
    //         }
    //         media.push(contents);
    //     }
    //     return media;
    // }

    // Upload files to firebase storage
    async uploadFiles () {
        let userId;
        try {
            userId = firebase.auth().currentUser.uid;
        } catch (err) {
            try {
                await firebase.auth().signInAnonymously();
                userId = firebase.auth().currentUser.uid;
                if(!userId) throw new Error();
            } catch (err) {
                prompt.add({message: `Missing authentication, please refresh and try again.`, level: 2, duration: 10000});
                return null;
            }
        }
        const fileIds = [];
        const fileUploadPromises = [];
        // prompt.add({message: JSON.stringify(this.files), level: 0, duration: 3000});
        for (const file of this.files) {
            let fileId = this.uuid().replaceAll('-', '');
            if(file.isVideo) fileId = 'VID' + fileId;
            const storageRef = storage.ref(fileId);
            const {width, height} = await this.getMediaDimension(file);
            file.contentType = file.type;
            if(file.type.toLowerCase().includes('gif')) {
                prompt.add({message: `Sorry, GIFs are not supported at the moment.`, level: 2, duration: 10000});
                return null;
            }
            fileUploadPromises.push(storageRef.put(file, {customMetadata: {width, height, owner: userId}}));
            fileIds.push({id: fileId, isVideo: file.isVideo});
            // fileIds.push(fileId);
        }
        try {
            await Promise.all(fileUploadPromises);
        } catch (err) {
            console.error(err);
            return null;
        }
        console.log('Images Uploaded!');
        return fileIds;
    }


    // old
    async uploadMeta (fileIds) {
        const title = document.querySelector('.title-input').value;
        const description = document.querySelector('.description-input').value;
        let userId = 'anonymous';
        try {
            userId = await firebase.auth().currentUser.getIdToken();
        } catch (err) {}
        try {
            const id = this.uuid();
            await db.collection('posts').doc(id).set({
                title,
                description,
                media: fileIds,
                id,
                private: false,
                userId
            });
            return id;
        } catch (err) {
            console.error(err);
            prompt.add({message: `Error Uploading`, level: 2, duration: 5000});
            return null;
        }
    }




    init () {
    // FILE DROP ZONE
    const dropZone = document.querySelector('.upload-space');
    dropZone.ondragover = function (e) {
        e.preventDefault();
    }
    dropZone.ondragenter = () => {
        dropZone.classList.add('hover');
          return false;
    }
    const fileLeft = () => {
        dropZone.classList.remove('hover');
        return false;
    }
    dropZone.ondragleave = fileLeft;
    dropZone.ondrop = (evt) => {
        
        evt.preventDefault();
        fileLeft();
        for (const file of evt.dataTransfer.files) {
           
            this.addFile(file);
        }
        this.refreshPreviews();
    }
    // FILE DROP ZONE

    // FILE CLICK SELECT
    const selectButton = document.querySelector('.upload-space');
    selectButton.addEventListener('change', (evt) => {
        for (const file of selectButton.files) {
            this.addFile(file);
        }
        selectButton.value = '';
        this.refreshPreviews();
    });
    // FILE CLICK SELECT

    // SUBMIT BUTTON
    const submitButton = document.querySelector('.submit-button');
    submitButton.addEventListener('click', async () => {
        try {
            analytics.logEvent('upload-submit');
        } catch(err) {}
        if(this.files.length == 0) {
            prompt.add({
                message: 'No files were selected', 
                level: 2, 
                duration: 3000
            });
            
            return;
        }
        // const fileIds = await this.uploadFiles();
        // const postId = await this.uploadMeta(fileIds);
        // window.location.replace(`http://picbun.com/p/${postId}`);;
        submitButton.classList.add('disabled');
        try {
            await this.launch();
        } catch (e) {
            // prompt.add({message: e, level: 2, duration: 5000});
        }
        submitButton.classList.remove('disabled');
    });
    // SUBMIT BUTTON
    }
}

const upload = new Upload();







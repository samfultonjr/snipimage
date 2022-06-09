const MAX_UPLOAD_SIZE = 30000000; // 30mb
const storage = firebase.storage();
const db = firebase.firestore();

// elements
const fileInsideText = document.querySelector('.file-upload-inside-text');
// const fileWrapperEl = document.querySelector('.file-wrapper');
const filePreviewEl = document.querySelector('.file-preview');


const lockToggleEl = document.querySelector('.lock-toggle');
const zoomInToggleEl = document.querySelector('.zoom-in-toggle');
const zoomOutToggleEl = document.querySelector('.zoom-out-toggle');
const spinRightToggleEl = document.querySelector('.spin-right-toggle');
const spinLeftToggleEl = document.querySelector('.spin-left-toggle');
const flipHorizontalToggleEl = document.querySelector('.flip-horizontal-toggle');
const flipVerticalToggleEl = document.querySelector('.flip-vertical-toggle');

const saveControlBackEl = document.querySelector('.back-control');
const saveControlDownloadEl = document.querySelector('.download-control');



class Upload {
    file = null;
    cropper = null;
    ratioLocked = true;
    horizontalFlipped = false;
    verticalFlipped = false;

    stateType = 'upload';
    // stateType = 'edit';
    // stateType = 'save';


    constructor() {
        this.init();
    }



    uuid () {
        const options = [1,2,3,4,5,6,7,8,9,'a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','k','K','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','x','X','y','Y','z','Z'];
        let uuid = '';
        for (let index = 0; index < 8; index++) {
            uuid += options[Math.floor(Math.random() * options.length)];
        }
        return uuid;
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


    // Load file preview
    async refreshPreview () {
        if(this.file &&  this.stateType === 'edit') {
            filePreviewEl.id = this.file.id;            
            const DURL =  window.URL.createObjectURL(this.file);
            filePreviewEl.src = DURL;
            filePreviewEl.hidden = false;   
            // fileWrapperEl.style.width = '100%';
            fileInsideText.hidden = true;      
            if(this.cropper) this.cropper.destroy();

            let dims = await this.getMediaDimension(this.file);

            this.cropper = new Cropper(filePreviewEl, {
                aspectRatio: (this.ratioLocked ? dims.width / dims.height : null),
                crop(event) {
                //   console.log(event.detail.x);
                //   console.log(event.detail.y);
                //   console.log(event.detail.width);
                //   console.log(event.detail.height);
                //   console.log(event.detail.rotate);
                //   console.log(event.detail.scaleX);
                //   console.log(event.detail.scaleY);
                },
                // fillColor: '#000'
              });
              document.querySelector('.upload-space').hidden = true;
        } else if( this.stateType === 'save') {
            // displaying final product
            this.cropper.destroy();
            filePreviewEl.hidden = false;
            // filePreviewEl.style.width = '100%';
            filePreviewEl.style.width = '';
            filePreviewEl.title = 'rick';
            document.querySelector('.upload-space').hidden = true;
            document.querySelector('.file-upload-container').classList.remove('file-upload-container-large');
            document.querySelector('.edit-controls').hidden = true;
            document.querySelector('.save-controls').hidden = false;
            document.querySelector('.download-url').download = this.uuid() + '-snipImage';
            document.querySelector('.download-url').href = filePreviewEl.src;
            document.querySelector('.download-url').title = 'snip';
        } else if( this.stateType === 'upload') {
            // back to original upload page
            this.cropper.destroy();
            filePreviewEl.id = ''            
            filePreviewEl.src = '';
            filePreviewEl.hidden = true;
            filePreviewEl.style.width = '0';
            document.querySelector('.file-upload-container').classList.add('file-upload-container-large');
            fileInsideText.hidden = false;      
            document.querySelector('.upload-space').hidden = false;
            document.querySelector('.edit-controls').hidden = false;
            document.querySelector('.save-controls').hidden = true;
            this.file = null;
            this.cropper = null;
            this.ratioLocked = true;
            this.horizontalFlipped = false;
            this.verticalFlipped = false;
        }

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

        file.id = this.uuid();
        this.file = file;
    }


    removeFile () {
        this.file = null;
        this.refreshPreview();
    }


    async init() {
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
            this.stateType = 'edit';
            this.refreshPreview();
        }
        // FILE DROP ZONE

        // FILE CLICK SELECT
        const selectButton = document.querySelector('.upload-space');
        selectButton.addEventListener('change', (evt) => {
            for (const file of selectButton.files) {
                this.addFile(file);
            }
            selectButton.value = '';
            this.stateType = 'edit';
            this.refreshPreview();
        });
        // FILE CLICK SELECT




        // Controls Listeners

        lockToggleEl.addEventListener('click', () => {
           if(this.cropper) {
            this.ratioLocked = !this.ratioLocked;
            this.refreshPreview();
           }
        });

        zoomInToggleEl.addEventListener('click', () => {
            if(this.cropper) {
                this.cropper.zoom(0.1);
            }
        });

        zoomOutToggleEl.addEventListener('click', () => {
            if(this.cropper) {
                this.cropper.zoom(-0.1);
            }
        });


        spinRightToggleEl.addEventListener('click', () => {
            if(this.cropper) {
                this.cropper.rotate(45);
            }
        });

        
        spinLeftToggleEl.addEventListener('click', () => {
            if(this.cropper) {
                this.cropper.rotate(-45);
            }
        });

        flipHorizontalToggleEl.addEventListener('click', () => {
            if(this.cropper) {
                if(this.horizontalFlipped){
                    this.cropper.scaleX(1);
                    this.horizontalFlipped = false;
                } else {
                    this.cropper.scaleX(-1);
                    this.horizontalFlipped = true;
                }        
            }
        });

        flipVerticalToggleEl.addEventListener('click', () => {
            if(this.cropper) {
                if(this.verticalFlipped){
                    this.cropper.scaleY(1);
                    this.verticalFlipped = false;
                } else {
                    this.cropper.scaleY(-1);
                    this.verticalFlipped = true;
                }   
            }
        });


        saveControlBackEl.addEventListener('click', () => {
            this.stateType = 'upload';

            this.refreshPreview();
        });

        // saveControlDownloadEl.addEventListener('click', () => {
            
        // })


        // SUBMIT BUTTON
        const submitButton = document.querySelector('.submit-button');
        submitButton.addEventListener('click', async () => {
            if(!this.file) {
                prompt.add({
                    message: 'No files were selected', 
                    level: 2, 
                    duration: 3000
                });
                
                return;
            }

            try {
                analytics.logEvent('snip-submit');
            } catch(err) {}
            submitButton.classList.add('disabled');

         


            let croppedCanvas = (await this.cropper.getCroppedCanvas());
            let durl = croppedCanvas.toDataURL();

            this.stateType = 'edit';
            this.removeFile();

            filePreviewEl.src = durl;

            this.stateType = 'save';
            this.refreshPreview();

            submitButton.classList.remove('disabled');


        });
        // SUBMIT BUTTON
    }
}

const upload = new Upload();







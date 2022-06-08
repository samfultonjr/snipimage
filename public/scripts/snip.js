const MAX_UPLOAD_SIZE = 30000000; // 30mb
const storage = firebase.storage();
const db = firebase.firestore();

// elements
const fileInsideText = document.querySelector('.file-upload-inside-text');
const fileWrapperEl = document.querySelector('.file-wrapper');
const filePreviewEl = document.querySelector('.file-preview');


const lockToggleEl = document.querySelector('.lock-toggle');
const zoomInToggleEl = document.querySelector('.zoom-in-toggle');
const zoomOutToggleEl = document.querySelector('.zoom-out-toggle');
const spinRightToggleEl = document.querySelector('.spin-right-toggle');
const spinLeftToggleEl = document.querySelector('.spin-left-toggle');
const flipHorizontalToggleEl = document.querySelector('.flip-horizontal-toggle');
const flipVerticalToggleEl = document.querySelector('.flip-vertical-toggle');


class Upload {
    file = null;
    cropper = null;

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


    // Load file preview
    async refreshPreview () {
        if(this.file) {
            filePreviewEl.id = this.file.id;            
            const DURL =  window.URL.createObjectURL(this.file);
            filePreviewEl.src = DURL;
            fileWrapperEl.hidden = false;   
            fileWrapperEl.style.width = '100%';
            fileInsideText.hidden = true;      
            if(this.cropper) this.cropper.destroy();
            this.cropper = new Cropper(filePreviewEl, {
                // aspectRatio: 16 / 9,
                crop(event) {
                //   console.log(event.detail.x);
                //   console.log(event.detail.y);
                //   console.log(event.detail.width);
                //   console.log(event.detail.height);
                //   console.log(event.detail.rotate);
                //   console.log(event.detail.scaleX);
                //   console.log(event.detail.scaleY);
                },
              });
        } else {
            filePreviewEl.id = ''            
            filePreviewEl.src = '';
            fileWrapperEl.hidden = true;
            fileInsideText.hidden = false;
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
            this.refreshPreview();
        });
        // FILE CLICK SELECT




        // Controls Listeners

        lockToggleEl.addEventListener('click', () => {
           if(this.cropper) {
            
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
                this.cropper.scaleX(-1);
            }
        });

        flipVerticalToggleEl.addEventListener('click', () => {
            if(this.cropper) {
                this.cropper.scaleY(-1);
            }
        });




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







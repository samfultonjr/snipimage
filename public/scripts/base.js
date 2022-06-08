
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}



class Prompt {
    constructor () {
        this.element = document.querySelector('.prompt');
    }

    // add new prompt
    add ({message, level, duration}) {
        this.clear();
        this.setMessage(message);
        this.setLevel(level);
        this.enable();
        if(this.remover) {
            clearTimeout(this.remover);
        }
        this.remover = setTimeout(()=>{
            this.clear();
        }, duration);
    }

    // sets opacity to 100
    enable () {
        this.element.classList.add('visible-prompt');
    }

    // clears previous prompt
    async clear () {
        this.element.className = 'prompt';
        // await sleep(2500);
        // this.element.textContent = '';
    }

    // set text 
    setMessage (message) {
        if(message.toLowerCase().includes('firebase')) {
            message = 'Server Error. Refresh and try again. :('
        }
        this.element.textContent = message;
    }

    // set level
    setLevel (level) {
        switch (level) {
            case 0:
                this.element.classList.add('info-prompt');
                break;
            case 1:
                this.element.classList.add('accent-prompt');
                break;
            case 2: 
                this.element.classList.add('error-prompt');
                break;
            default:
                this.element.classList.add('info-prompt');
                break;
        }
    }
}

function getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

const prompt = new Prompt();





function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const elHeight = element.videoHeight;
    const elWidth = element.videoWidth;
    return (
        rect.top >= (-500) &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) +  (500) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}




// let imageEls = document.querySelectorAll('image');
// let videoEls = document.querySelectorAll('video');

// const contentFit = () => {
//     // const vHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

//     // for (const videoEl of videoEls) {
//     //     let videoHeight = videoEl.videoWidth;
//     //     if(videoHeight > vHeight * 0.5) {
//     //         videoEl.style =  `height: ${(JSON.parse(vHeight) * 0.5)}px;`;
//     //     }
//     // }

//     // for (const imageEl of imageEls) {
//     //     let imageHeight = imageEl.imageHeight;
//     //     if(imageHeight > vHeight * 0.5) {
//     //         imageEl.style =  `height: ${(JSON.parse(vHeight) * 0.5)}px;`;
//     //     }
//     // }
//     // setTimeout(contentFit, 5000);
// }

// contentFit();

    

// let contentContainerEl =  document.querySelector('div.content-container');
let footerEl = document.querySelector('div.footer');
footerEl.classList.add('invisible');

let scrollTimeout = setTimeout(()=> {}, 100);
let oldScrollY = scrollY;

document.addEventListener('scroll', function(e) {

    // if at bottom of page
    // if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
    //     footerEl.classList.remove('invisible');
    //     console.log('Scrolled to bottom');
    // } else

    // contentFit();

    if(scrollY < oldScrollY) {
         // if scrolling up
        // clearTimeout(scrollTimeout);
        // footerEl.classList.remove('invisible');
        // scrollTimeout = setTimeout(() => {
        //     footerEl.classList.add('invisible');
        // }, 1000) ;
        // console.log('Scrolled up');
    } else {
        // scrolling down, remove footer for visibility

        const body = document.body;
        const html = document.documentElement;

        const totalHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
        if ((window.innerHeight + window.scrollY) >= (totalHeight)) {
            // at bottom
            clearTimeout(scrollTimeout);
            footerEl.classList.remove('invisible');
            scrollTimeout = setTimeout(() => {
                footerEl.classList.add('invisible');
            }, 10000) ;
            // console.log('Scrolled to bottom');
        } else {
            clearTimeout(scrollTimeout);
            footerEl.classList.add('invisible');
            // console.log('Scrolled down');
        }

    }

    oldScrollY = scrollY;
});






// (async () => {

    // try {
    //     userId = await firebase.auth().currentUser.getIdToken();
    //     if(!userId) throw new Error();
    //     console.log('Initiated found user');
    // } catch (error) {
    //     try {
    //         await firebase.auth().signInAnonymously();
    //         userId = await firebase.auth().currentUser.getIdToken();
    //         firebase.analytics().logEvent('new_visitor');
    //         console.log('Initiated anonymous user');
    //     } catch (err) {
    //         console.log(`Failed user initialization: ${err}`);
    //     }
    // }
// })();







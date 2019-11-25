export default function ZebraTime(d) {
    return new ZebraClass(d || new Date());
}

class ZebraClass {
    constructor(date,precision) {
        this.date = date;
        this._precision = precision || "minute";
    }
    get hour() {
        let zhour = this.date.getUTCHours();
        if (zhour > 23) zhour -= 23;
        return String.fromCharCode(65+zhour);
    }
    get minute() {
        return this.hour+":" + this.formatTime(this.date.getUTCMinutes());
    }
    get second() {
        return this.minute+":" + this.formatTime(this.date.getUTCSeconds());
    }
    precision(p) {
        this._precision = p;
        return this;
    }
    toString() {
        if (this._precision === "hour") return this.hour;
        else if (this._precision === "minute") return this.minute;
        else if (this._precision === "second") return this.second;
        else return this.minute;
    }
    tick(callback) {
        this.date = new Date();
        callback();
        setTimeout(this.tick.bind(this,callback),1000-(this.date.getTime()%1000));
    }
    formatTime(n) {
        return n<10?"0"+n:n.toString()
    }

    timeElement() {
        let elem = document.createElement("div");
        this.tick(()=>{
            elem.textContent = this.second;
        });
        return elem;
    }

    mapElement(bgColor,fgColor) {
        let elem = document.createElement('div');
        elem.id = "zebra-time-map";
        elem.style.display="flex";
        elem.style.position="relative";
        elem.style.backgroundImage="url("+this.images.world+")";
        elem.style.backgroundSize="100% 100%";
        elem.style.backgroundColor=bgColor || "#31313F" || "#475e8c";
        elem.style.backgroundRepeat="no-repeat";
        elem.style.width="100%";
        elem.style.height="100%";
        elem.style.overflow="hidden";
        let letterElem = document.createElement('div');
        letterElem.style.backgroundImage="url("+this.images.letters+")";
        letterElem.style.backgroundPosition="center";
        letterElem.style.backgroundSize="contain";
        letterElem.style.backgroundRepeat="no-repeat";
        letterElem.style.position="absolute";
        letterElem.style.height="100%";
        letterElem.style.width="100%";
        letterElem.style.filter="drop-shadow(4px 4px 6px black)";
        elem.append(letterElem);
        let workElem = {
            left:document.createElement('div'),
            right:document.createElement('div')
        };
        for (let e in workElem) {
            workElem[e].style.position="absolute";
            workElem[e].style.width="40%";
            workElem[e].style.height="100%";
            workElem[e].style.opacity="0.3";
            workElem[e].style.left="100%";
            workElem[e].style.background="linear-gradient(to right, transparent, "+(fgColor||"#576efc")+" 15% 85%, transparent 100%)";
            elem.append(workElem[e]);
        }
        this.tick(()=>{
            let time = (this.date.getUTCHours() * 60) + this.date.getUTCMinutes();
            workElem.left.style.left = (((1440-time)/1440)*100)-20+"%";
            workElem.right.style.left = ((time/1440)*100)-20+"%";
        });

        return elem;
    }
    get images() {
        return {
            world:"data:image/png;base64,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",
            letters:"data:image/png;base64,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",
            lettersForward:"data:image/png;base64,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",
            lettersBack:"data:image/png;base64,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",
        }
    }
}

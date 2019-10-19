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
    timeElement() {
        let elem = document.createElement("div");
        this.tick(()=>{
            elem.textContent = this.second;
        });
        return elem;
    }

    _draw(parentElem) {
        this.parentElem = parentElem;
        this.timeElem = document.createElement('div');
        this.mapElem = document.createElement('div');
        this.timeElem.id = "zebra-time-clock";
        this.mapElem.id = "zebra-time-map";
        this.parentElem.append(this.timeElem);
        this.parentElem.append(this.mapElem);
        let img = document.createElement("img");
        this.workElemLeft = document.createElement('div');
        this.workElemRight = document.createElement('div');
        img.src = "/img/worldstrip.png";
        this.mapElem.appendChild(img);
        this.mapElem.appendChild(this.workElemLeft);
        this.mapElem.appendChild(this.workElemRight);
        this.debugTime = null;

        setTime.call(this);
        setInterval(setTime.bind(this),1000);

        function setTime() {
            let d = new Date();
            if (this.debugTime) {
                this.debugTime = new Date(this.debugTime.getTime()+2500000);
                d = this.debugTime;
            }
            let zhour = d.getUTCHours();
            if (zhour > 23) zhour -= 23;
            zhour -= 12; // shift A from midnight to noon
            this.timeElem.innerHTML = String.fromCharCode(77+zhour)+":"+this.formatTime(d.getUTCMinutes())+":"+this.formatTime(d.getUTCSeconds());
            this.drawLight(d);

            this.timeElem.addEventListener('click',()=>{
                this.debugTime = new Date();
            })
        }
    }
    formatTime(n) {return n<10?"0"+n:n.toString()}

    drawLight(d) {
        let mapWidth = this.mapElem.offsetWidth;
        let lightWidth = this.workElemLeft.offsetWidth;
        let offset = 8;
        let time = ((d.getUTCHours() + offset) * 60) + d.getUTCMinutes();
        time = time>=1440?time-1440:time;
        let time2 = time+1440;
        time = time>=2880?time-2880:time;
        this.workElemLeft.style.right=((time/1440)*mapWidth)-lightWidth+"px";
        this.workElemRight.style.right=((time2/1440)*mapWidth)-lightWidth+"px";
    }

    highlightMap(hour) {
        let offset = 12;
        let workstart = 8;
        let workspan = 10;
        let start = offset + (workstart - hour);
        let end = offset + (workstart+workspan - hour);
        if (start < 0) start += 23;
        if (end > 23) end -= 23;
        for (let i=0;i<this.mapElem.children.length;i++) {
            this.mapElem.children[i].classList.remove('work');
            if ((start < end) && (i >= start && i < end)) this.mapElem.children[i].classList.add('work');
            if ((start > end) && (i >= start || i < end)) this.mapElem.children[i].classList.add('work');
        }
    }
    drawMap() {
        // add letters
//        let letters = "OPQRSTUVWXABCDEFGHIJKLMN";
        let letters = "LKJIHGFEDCBAXWVUTSRQPONM";
        for (let i = 0; i < letters.length; i++) {
            let letterElem = document.createElement("span");
            letterElem.innerHTML = letters.charAt(i);
            this.mapElem.appendChild(letterElem);
        }
    }
}

"use strict";

let Ajax = {
    get: function (url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200) resolve(xhr.responseText);
                else reject(xhr.status)
            };
            xhr.send();
        });
    },
    post: function (url, object) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200) resolve(xhr.responseText);
                else reject(xhr.status)
            };
            let data = new FormData();
            for (let key in object) {
                data.append(key, object[key])
            }
            xhr.send(data);
        });
    }
};

let page = {
    init: function () {
        this.fader.init(this);
        this.users.init(this);
        this.notes.init(this);
        this.description.init(this)
    }
};
page.users = {
    users: [],
    init: function (parent) {
        this.parent = parent;
        this.container = document.querySelector(".panel.users");
        this.form = document.forms.addUser;
        this.list = this.container.querySelector("ul");
        this.active = null;
        this.events();
        this.streams();
        this.subscribers();
        this.updateUsers();
    },
    events: function () {
        this.form.addEventListener("submit", e => e.preventDefault())
    },
    streams: function () {
        let listClickStream = Rx.Observable.fromEvent(this.list, "click");
        this.addUserStream = Rx.Observable.fromEvent(this.form, "submit")
            .filter(e => e.target.elements.userName.value.length > 0);
        this.deleteUserStream = listClickStream
            .filter(e => e.target.className === "del")
            .map(e => e.target.dataset.id);
        this.viewMoreStream = listClickStream
            .filter(e => e.target.className === "more")
            .map(e => e.target.dataset.id).share();
        this.delUserStream = Rx.Observable.create(observer => this.delUserObserver = observer).share();
    },
    subscribers: function () {
        this.addUserStream.subscribe(e => this.addUser(e.target.elements.userName.value));
        this.deleteUserStream.subscribe(this.delUser.bind(this));
        this.viewMoreStream.subscribe(this.setActive.bind(this))
    },
    createListElem: function (user) {
        let li = document.createElement("LI");
        let p = document.createElement("P");
        let delbtn = document.createElement("DIV");
        let morebtn = document.createElement("DIV");

        p.textContent = user.name;
        delbtn.dataset.id = user.id;
        morebtn.dataset.id = user.id;

        delbtn.className = "del";
        morebtn.className = "more";
        if (user.id === this.active) li.classList.add("active");

        li.appendChild(p);
        li.appendChild(delbtn);
        li.appendChild(morebtn);

        return li
    },
    updateUsers: function () {
        this.parent.fader.show();
        Ajax.get("http://pdfstep.zzz.com.ua?action=user&method=getAll").then(response => {
            let responseObject = JSON.parse(response);
            if (responseObject.errors !== "no") return;
            this.users = responseObject.data;
            this.redraw();
        });
        this.parent.fader.hide();
    },
    redraw: function () {
        this.list.innerHTML = "";
        let fragment = document.createDocumentFragment();
        this.users.forEach(user => fragment.appendChild(this.createListElem(user)));
        this.list.appendChild(fragment);
    },
    addUser: function (name) {
        this.parent.fader.show();
        Ajax.post("http://pdfstep.zzz.com.ua?action=user&method=add", {name: name}).then(this.updateUsers.bind(this));
        this.form.elements.userName.value = "";
    },
    delUser: function (id) {
        this.parent.fader.show();
        Ajax.post("http://pdfstep.zzz.com.ua?action=user&method=del", {id: id}).then(this.updateUsers.bind(this));
        this.delUserObserver.next(id)
    },
    setActive: function (id) {
        this.active = id;
        this.redraw();
    }
};
page.notes = {
    notes: [],
    init: function (parent) {
        this.parent = parent;
        this.container = document.querySelector(".panel.notes");
        this.form = document.forms.addNote;
        this.list = this.container.querySelector("ul");
        this.active = null;
        this.user = null;
        this.events();
        this.streams();
        this.subscribers();
    },
    events: function () {
        this.form.addEventListener("submit", e => e.preventDefault());
    },
    streams: function () {
        let listClickStream = Rx.Observable.fromEvent(this.list, "click");
        this.formStream = Rx.Observable.fromEvent(this.form, "submit");
        this.viewDescStream = listClickStream
            .filter(e => e.target.classList.contains("more"))
            .map(e => e.target.dataset.id).share();
        this.viewDelStream = listClickStream
            .filter(e => e.target.classList.contains("del"))
            .map(e => e.target.dataset.id).share();
        this.activeNoteStream = Rx.Observable.create(observer => this.note = observer);
        this.delNoteStream = Rx.Observable.create(observer => this.delNoteOserver = observer)
    },
    subscribers: function () {
        this.parent.users.viewMoreStream.subscribe(this.getNotes.bind(this));
        this.parent.users.viewMoreStream.subscribe(this.setCurrentUser.bind(this));
        this.formStream.subscribe(this.addNote.bind(this));
        this.viewDescStream.subscribe(this.setActive.bind(this));
        this.parent.users.delUserStream.subscribe(this.delCurrentUser.bind(this));
        this.viewDelStream.subscribe(this.delNote.bind(this));
        this.viewDescStream.subscribe(this.activeNote.bind(this))
    },
    getNotes: function (id) {
        this.parent.fader.show();
        Ajax.post("http://pdfstep.zzz.com.ua?action=todo&method=get", {id: id}).then(response => {
            let respObject = JSON.parse(response);
            if (respObject.errors !== "no") return;
            this.notes = respObject.data;
            this.redraw();
        });
        this.parent.fader.hide();
    },
    redraw: function () {
        this.list.innerHTML = "";
        let fragment = document.createDocumentFragment();
        this.notes.forEach(note => fragment.appendChild(this.createListElem(note)));
        this.list.appendChild(fragment);
    },
    createListElem: function (note) {
        let li = document.createElement("LI");
        let p = document.createElement("P");
        let delbtn = document.createElement("DIV");
        let morebtn = document.createElement("DIV");

        p.textContent = note.name;
        delbtn.dataset.id = note.id;
        morebtn.dataset.id = note.id;

        delbtn.className = "del";
        morebtn.className = "more";
        if (note.id === this.active) li.classList.add("active");

        li.appendChild(p);
        li.appendChild(delbtn);
        li.appendChild(morebtn);

        return li
    },
    addNote: function (e) {
        if (this.user === null) {
            alert("Please select User");
            return
        }
        if (!this.checkForm(e)) alert("Enter all fields");
        let data = {
            id: this.user,
            name: this.form.elements.noteName.value,
            desc: this.form.elements.desription.value
        };
        this.parent.fader.show();
        Ajax.post("http://pdfstep.zzz.com.ua?action=todo&method=add", data).then(() => this.getNotes(this.user));
        this.form.reset()
    },
    checkForm: function (e) {
        return e.target.elements.noteName.value.length > 0
            && e.target.elements.desription.value.length > 0
    },
    delCurrentUser: function (id) {
        if (this.user === id) {
            this.user = null;
            this.notes = [];
        }
        this.redraw();
    },
    setCurrentUser: function (id) {
        if (this.user === id) return;
        this.user = id;
        this.active = null;
    },
    setActive: function (id) {
        this.active = id;
        this.redraw();
    },
    delNote: function (id) {
        this.parent.fader.show();
        Ajax.post("http://pdfstep.zzz.com.ua?action=todo&method=delete", {id: id}).then( () => this.getNotes(this.user));
        this.delNoteOserver.next(id);
    },
    activeNote: function (id) {
        let note = this.notes.filter(e => e.id === id);
        this.note.next(note);
    }
};
page.fader = {
    init: function (parent) {
        this.parent = parent;
        this.fader = document.querySelector(".fader");
        this.hide();
    },
    show: function () {
        this.fader.style.display = "";
    },
    hide: function () {
        this.fader.style.display = "none";
    }
};
page.description = {
    notes: [],
    init: function (parent) {
        this.parent = parent;
        this.container = document.querySelector(".panel.details");
        this.user = null;
        this.subscribers();
    },
    subscribers: function () {
        this.parent.notes.activeNoteStream.subscribe(this.updateNotes.bind(this));
        this.parent.notes.delNoteStream.subscribe(this.delNote.bind(this));
        this.parent.users.viewMoreStream.subscribe(this.setUser.bind(this));
        this.parent.users.delUserStream.subscribe(this.delUser.bind(this));
    },
    updateNotes: function (notes) {
        this.user = notes[0].users_id;
        this.notes = notes;
        this.redraw();
    },
    redraw: function () {
        this.container.innerHTML = "";
        let fragment = document.createDocumentFragment();
        this.notes.forEach(e => fragment.appendChild(this.createNote(e)));
        this.container.appendChild(fragment);
    },
    createNote: function (note) {
        let fragment = document.createDocumentFragment();
        let name = document.createElement("H3");
        let description = document.createElement("P");

        name.textContent = note.name;
        description.textContent = note.desc;

        fragment.appendChild(name);
        fragment.appendChild(description);

        return fragment
    },
    delNote: function (id) {
        this.notes = this.notes.filter(e => e.id !== id);
        this.redraw();
    },
    setUser: function (id) {
        if (this.user !== id) this.notes = [];
        this.redraw();
    },
    delUser: function (id) {
        if (this.user === id) this.notes = [];
        this.redraw();
    }
};
document.addEventListener("DOMContentLoaded", page.init.bind(page));
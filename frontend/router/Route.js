export default class Route {
    // roles : liste des rôles autorisés (vide = page publique)
    constructor(url, title, pathHtml, pathJS = "", roles = []) {
        this.url = url;
        this.title = title;
        this.pathHtml = pathHtml;
        this.pathJS = pathJS;
        this.roles = roles;
    }
}

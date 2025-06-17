Popzy.elements = [];

function Popzy(options = {}) {
    this.opt = Object.assign(
        {
            closeMethods: ['button', 'overlay', 'escape'],
            destroyOnClose: true,
            footer: false,
            cssClass: [],
        },
        options,
    );
    this.template = document.querySelector(`#${this.opt.templateId}`);

    if (!this.template) {
        console.error('not have this modal');
        return;
    }

    const { closeMethods } = this.opt;

    this._allowButtonClose = closeMethods.includes('button');
    this._allowOverlayClose = closeMethods.includes('overlay');
    this._allowEscapeClose = closeMethods.includes('escape');

    this._handleEscape = this._handleEscape.bind(this);

    //list footer button
    this._footerButtons = [];
}

Popzy.prototype._build = function () {
    const content = this.template.content.cloneNode(true);

    this._backDrop = document.createElement('div');
    this._backDrop.className = 'popzy__backdrop';

    const modalContainer = document.createElement('div');
    modalContainer.className = 'popzy__container';

    this.opt.cssClass.forEach((className) => {
        if (typeof className === 'string') {
            modalContainer.classList.add(className);
        }
    });

    //modal close button
    if (this._allowButtonClose) {
        const modalClose = this._createButton('&times;', 'popzy__close', () => this.close());

        modalContainer.append(modalClose);
    }

    const modalContent = document.createElement('div');
    modalContent.className = 'popzy__content';

    modalContent.append(content);
    modalContainer.append(modalContent);

    //footer modal
    if (this.opt.footer) {
        this._modalFooter = document.createElement('div');
        this._modalFooter.className = 'popzy__footer';

        this._renderFooterContent();
        this._renderFooterButton();
        modalContainer.append(this._modalFooter);
    }

    this._backDrop.append(modalContainer);
    document.body.append(this._backDrop);
};

//add footer
Popzy.prototype.setModalFooter = function (html) {
    this._footerContent = html;

    this._renderFooterContent();
};

//add footer button
Popzy.prototype.addFooterButton = function (title, cssClass, callback) {
    const button = this._createButton(title, cssClass, callback);

    this._footerButtons.push(button);
    this._renderFooterButton();
};

//render footer content
Popzy.prototype._renderFooterContent = function () {
    if (this._modalFooter && this._footerContent) {
        this._modalFooter.innerHTML = this._footerContent;
    }
};

Popzy.prototype._renderFooterButton = function () {
    if (this._modalFooter) {
        this._footerButtons.forEach((button) => {
            this._modalFooter.append(button);
        });
    }
};

//create btn
Popzy.prototype._createButton = function (title, cssClass, callback) {
    const button = document.createElement('button');
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback;

    return button;
};

Popzy.prototype.open = function () {
    Popzy.elements.push(this);

    if (!this._backDrop) {
        this._build();
    }

    setTimeout(() => {
        this._backDrop.classList.add('popzy--show');
    }, 0);

    //disable scroll
    document.body.classList.add('popzy--no-scroll');
    document.body.style.paddingRight = this._getScrollbarWidth() + 'px';

    if (this._allowOverlayClose) {
        this._backDrop.onclick = (e) => {
            if (e.target === this._backDrop) {
                this.close();
            }
        };
    }

    if (this._allowEscapeClose) {
        document.addEventListener('keydown', this._handleEscape);
    }

    this._backDrop.addEventListener(
        'transitionend',
        () => {
            if (typeof this.opt.onOpen === 'function') this.opt.onOpen();
        },
        { once: true },
    );

    return this._backDrop;
};

Popzy.prototype._handleEscape = function (e) {
    const lastModal = Popzy.elements[Popzy.elements.length - 1];

    if (e.key === 'Escape' && lastModal === this) {
        this.close();
    }
};

Popzy.prototype.close = function (destroy = this.opt.destroyOnClose) {
    Popzy.elements.pop();
    this._backDrop.classList.remove('popzy--show');

    if (this._allowEscapeClose) {
        document.removeEventListener('keydown', this._handleEscape);
    }

    this._backDrop.addEventListener(
        'transitionend',
        () => {
            if (this._backDrop && destroy) {
                this._backDrop.remove();
                this._backDrop = null;
                this._modalFooter = null;
            }

            if (!Popzy.elements.length) {
                //disable scroll
                document.body.classList.remove('popzy--no-scroll');
                document.body.style.paddingRight = '';
            }

            if (typeof this.opt.onClose === 'function') this.opt.onClose();
        },
        { once: true },
    );
};

Popzy.prototype.destroy = function () {
    this.close(true);
};

//prototype
Popzy.prototype._getScrollbarWidth = function () {
    if (this._scrollbarWidth) return this._scrollbarWidth;

    const div = document.createElement('div');
    Object.assign(div.style, {
        position: 'absolute',
        overflow: 'scroll',
        top: '-9999px',
    });

    document.body.appendChild(div);

    this._scrollbarWidth = div.offsetWidth - div.clientWidth;

    document.body.removeChild(div);

    return this._scrollbarWidth;
};

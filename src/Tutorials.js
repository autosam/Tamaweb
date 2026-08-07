class TutorialSequence {
    currentSequenceIndex = 0;
    intervalDriver;
    sequenceTimer;

    constructor({ parent = document.body } = {}, sequences) {
        this.sequences = sequences;
        this.parentElement = UI.create({
            componentType: 'div',
            parent: document.body,
        })
        this.domParentNode = parent;
    }
    start(){
        this.currentSequenceIndex = 0;
        this.trigger();
    }
    trigger(index = this.currentSequenceIndex){
        this.clear();

        const currentSequence = this.sequences[index];
        if(!currentSequence) return console.log('Tutorial ended', index);

        if(currentSequence.timer) {
            this.sequenceTimer = setTimeout(() => {
                this.goNext();
            }, currentSequence.timer);
        }

        const targetElement = this.domParentNode.querySelector(currentSequence.element);

        if(!targetElement) {
            setTimeout(() => this.trigger(), 50);
            return;
        }

        const tutorialElement = UI.create({
            parent: this.parentElement,
            className: 'tutorial__backdrop',
            children: [
                {
                    className: 'tutorial__content message-bubble',
                    innerHTML: currentSequence.text,
                    style: 'display: none;',
                },
                {
                    className: 'tutorial__target',
                    innerHTML: '',
                    _mount: currentSequence.onMount,
                    onClick: () => {
                        if(currentSequence.clickable === false) return;
                        targetElement.click();
                        setTimeout(() => this.goNext())
                    },
                }
            ]
        })

        const tutorialTargetElement = tutorialElement.querySelector('.tutorial__target');
        const tutorialContentElement = tutorialElement.querySelector('.tutorial__content');
        this.intervalDriver = setInterval(() => {
            if(!targetElement) return;
            const boundingRect = targetElement.getBoundingClientRect();
            if(!boundingRect) return;
            const tutorialContentElementBoundingRect = tutorialContentElement.getBoundingClientRect();
            const styles = window.getComputedStyle(targetElement)
            const borderRadius = styles.borderRadius === '0px' ? '12px' : styles.borderRadius;
            tutorialTargetElement.style.top = `${boundingRect.top}px`;
            tutorialTargetElement.style.left = `${boundingRect.left}px`;
            tutorialTargetElement.style.width = `${boundingRect.width}px`;
            tutorialTargetElement.style.height = `${boundingRect.height}px`;
            tutorialTargetElement.style.borderRadius = borderRadius;

            tutorialContentElement.style.top = `${boundingRect.top - tutorialContentElementBoundingRect.height - 12}px`;
            tutorialContentElement.style.left = `${boundingRect.left}px`;
            tutorialContentElement.style.display = 'block';
        }, 16);
    }
    goNext(){
        this.trigger(++this.currentSequenceIndex);
    }
    goBack(){

    }
    clear(){
        this.parentElement.textContent = '';
        clearInterval(this.intervalDriver);
        clearTimeout(this.sequenceTimer);
    }
    static selectors = {
        canvas: () => `canvas`,
        nthGridItem: (number) => `.grid-item:nth-child(${number})`,
        nthBtn: (number) => `.generic-btn.stylized:nth-child(${number})`,
        backBtn: () => '.back-btn.generic-btn',
        sliderAcceptBtn: () => `#accept-btn`,
        sliderCancelBtn: () => `#cancel-btn`,
        sliderContent: () => `.content.surface-stylized`,
    }
}

const feedingSequence = [
    {
        text: "Your pet is hungry! Click here to feed them!",
        element: TutorialSequence.selectors.canvas(),
        onMount: () => {
            App.pet.stats.current_hunger = 10;
        }
    },
    {
        text: "Your pet is hungry! Click here to feed them!",
        element: TutorialSequence.selectors.nthGridItem(2),
    },
    {
        text: `In this menu you'll be able to feed your pet various items!<br>Click on the first option to feed them food!`,
        element: TutorialSequence.selectors.nthBtn(2),
    },
    {
        text: `Your pet is currently a baby so they can only drink milk, <br> You can purchase more food and snacks from the Market!`,
        element: TutorialSequence.selectors.sliderContent(),
    },
    {
        text: `Click here to feed them`,
        element: TutorialSequence.selectors.sliderAcceptBtn(),
    },
    {
        text: "Wait until your pet finishes eating.",
        element: TutorialSequence.selectors.canvas(),
        timer: App.constants.ONE_SECOND * 3,
        clickable: false,
        onMount: () => {
            App.pet.stats.current_hunger = 30;
            console.log('mounted!');
        }
    },
    {
        text: `Click here to close the food menu`,
        element: TutorialSequence.selectors.sliderCancelBtn(),
    },
    {
        text: `Click here`,
        element: TutorialSequence.selectors.backBtn(),
    },
]
const statsCheckingSequence = [
    {
        text: `Let's now check your pet's stats`,
        element: TutorialSequence.selectors.canvas(),
    },
    {
        text: `Open Stats Menu`,
        element: TutorialSequence.selectors.nthGridItem(1),
    },
    {
        text: `Open stats`,
        element: TutorialSequence.selectors.nthBtn(2),
    },
    {
        text: `Here you will be able to see your pet's stats.`,
        element: '#tab-1',
    },
    {
        text: `Here you will be able to see your pet's stats.`,
        element: '#tab-1',
    },
]

const tutorialSequence = new TutorialSequence(
    {
        parent: document.querySelector(".screen-wrapper"),
    },
    [
        ...feedingSequence,
        ...statsCheckingSequence,
    ],
);

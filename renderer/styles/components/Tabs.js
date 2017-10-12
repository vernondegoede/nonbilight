export const tabStyles = `
    .tabs {
        padding: 0;
        margin: 0;
        list-style: none;
        display: flex;
    }

    .tabs__item {
        padding: 0;
        margin: 0;
        width: 50%;
        border: 1px solid rgba(0, 0, 0, .2);
    }

    .tabs__item:first-child {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        border-right: 0;
    }

    .tabs__item:last-child {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    .tabs__item.is-active {
        background: none;
    }

    .tabs__item:not(.is-active) {
        background: #FAFAFA;
    }

    .tabs__item.is-active a {
        color: #0095FF;        
    }

    a {
        padding: 6px 0;
        display: block;
        font-size: 12px;
        text-align: center;
    }
`;

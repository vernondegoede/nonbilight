export const globalStyles = `
    body {
        font-family: system-ui;
    }

    main {
        padding: 20px;
    }

    a {
        text-decoration: none;
        color: black;
    }

    .main {
        margin-top: 16px;
    }

    * {
        margin: 0;
        padding: 0;
        text-rendering: optimizeLegibility;
        box-sizing: border-box;
    }
    
    @media (min-resolution: 2dppx) {
        * {
            text-rendering: geometricPrecision;
        }
    }
`;

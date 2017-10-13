import { colorPreviewStyles } from "./../styles/components/ColorsPreview";

const parseDisplayRgbValue = values => `rgba(${values.join(",")})`;

export default ({ color }) => (
  <div>
    {color && (
      <div className="colors-preview">
        {console.log("color in preview", color)}
        <div
          key={color._rgb}
          className="colors-preview__item"
          style={{
            backgroundColor: parseDisplayRgbValue(color._rgb),
          }}
        />
      </div>
    )}
    <style jsx>{colorPreviewStyles}</style>
  </div>
);

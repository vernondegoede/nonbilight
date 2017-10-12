import { colorPreviewStyles } from "./../styles/components/ColorsPreview";

const parseDisplayRgbValue = values => `rgba(${values.join(",")})`;

export default ({ colors }) => (
  <div>
    <div className="colors-preview">
      {colors.map(({ _rgb }) => (
        <div
          key={_rgb}
          className="colors-preview__item"
          style={{
            backgroundColor: parseDisplayRgbValue(_rgb),
          }}
        />
      ))}
    </div>
    <style jsx>{colorPreviewStyles}</style>
  </div>
);

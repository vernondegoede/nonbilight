import { tabStyles } from "./../styles/components/Tabs";

const tabTitles = {
  theater_mode: "Theater Mode",
  manual_mode: "Manual Mode",
};

const Tabs = ({ tabs, activeTab, onSwitchTab }) => (
  <div>
    <ul className="tabs">
      {tabs.map(tab => (
        <li
          className={tab === activeTab ? "tabs__item is-active" : "tabs__item"}
          key={tab}
        >
          <a
            href="/"
            onClick={e => {
              e.preventDefault();
              onSwitchTab(tab);
            }}
          >
            {tabTitles[tab]}
          </a>
        </li>
      ))}
    </ul>
    <style jsx>{tabStyles}</style>
  </div>
);

export default Tabs;

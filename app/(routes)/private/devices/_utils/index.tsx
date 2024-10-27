import { IBrowser } from "@/app/_interface/browser";

export const getFormattedBrowsers = (browsers: IBrowser[]) => {
  return browsers.map((browser) => {
    return {
      value: browser.id,
      label: browser.name,
      icon: () => {
        return (
          <img
            className="mr-2"
            src={`data:image/png;base64,${browser.logo}`}
            alt={browser.name}
            height={15}
            width={15}
          />
        );
      },
    };
  });
};

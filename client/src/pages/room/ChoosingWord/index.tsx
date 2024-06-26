import { FC } from "react";
import Typography from "../../../components/ui/Typography";
import Loader from "../../../components/ui/Loader";
import Players from "../WaitingWord/Players";
import { WORD_LIST, SELECTABLE_WORDS_LIST_LENGTH } from "../../../constants/game";
import ChipSelector from "../../../components/ui/ChipSelector";
import { UserType } from "../../../interfaces/typing";
import { useTranslation } from "react-i18next";
import "./style.scss";

interface ChoosingWordProps {
  time: number;
  players: UserType[];
  category: string;
  difficalty: string;
  customWords: string[];
  message?: string | null;
  onWordSelected: (word: string) => void;
}

const ChoosingWord: FC<ChoosingWordProps> = ({
  time,
  players,
  category,
  difficalty,
  message,
  customWords,
  onWordSelected,
}) => {
  const { t } = useTranslation();

  const getRandomWords = (length: number = SELECTABLE_WORDS_LIST_LENGTH) => {
    let words = [];
    if (customWords.length > 0) {
      words = customWords;
    } else {
      words = WORD_LIST[category][difficalty];
    }
    const randomWords: string[] = [];
    while (randomWords.length < length) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (randomWords.includes(words[randomIndex])) continue;
      randomWords.push(words[randomIndex]);
    }

    return randomWords.map((word: string) => {
      return {
        id: "",
        value: word,
      };
    });
  };

  return (
    <div className="choosing-word-container">
      {message && (
        <>
          <Typography className="artist-label" variant="text-accent">
            {message}
          </Typography>
        </>
      )}
      <Typography variant="sub-header-main" className="choosing-word-label">
        {t("you-are-choosing-a-word")}
      </Typography>
      <Loader time={time} />
      <Typography variant="text-accent" className="words-label">
        {t("words")}
      </Typography>
      <ChipSelector
        style={{ alignSelf: "center" }}
        chips={getRandomWords()}
        name="the-words"
        onChange={(e: any) => {
          onWordSelected(
            t(`the-words.${e.value}`) == `the-words.${e.value}`
              ? e.value
              : t(`the-words.${e.value}`)
          );
        }}
      />
      <Players players={players} />
    </div>
  );
};

export default ChoosingWord;

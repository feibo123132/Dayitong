import { HomeCarousel } from '../components/HomeCarousel';
import { QuickAccess } from '../components/QuickAccess';
import { CurrentActivity } from '../components/CurrentActivity';

export const Home = () => {
  return (
    <div className="space-y-6">
      <section>
        <HomeCarousel />
      </section>

      <section>
        <QuickAccess />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 px-2 text-jieyou-text">当前活动</h2>
        <CurrentActivity />
      </section>
    </div>
  );
};

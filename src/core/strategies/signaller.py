import pandas as pd
from typing import Any, List
import json
import sys
import importlib

def process_strats(strat_list: List[str], ohlc_store: dict[str, pd.DataFrame]):
    results = []

    for strat_name in strat_list:
        module = importlib.import_module(strat_name)
        signal = module.signal(ohlc_store) # todo: abstract signal
        results.append({
            "meta": {
                "name": strat_name,
            },
            "signal": signal
        })

    return results


def main():
    try:
        strat_list: List[str] = json.loads(sys.argv[1])
        ohlc_store: dict[str, Any] = json.loads(sys.argv[2])

    except:
        # log
        print(None)
    else:
        signals = process_strats(strat_list, ohlc_store)
        print(json.dumps(signals))
    finally:
        sys.stdout.flush()


main()

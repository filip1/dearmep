# SPDX-FileCopyrightText: © 2022 Tim Weber
#
# SPDX-License-Identifier: AGPL-3.0-or-later

import mmdbencoder  # type: ignore


# This whole function is basically taken from mmdbencoder's readme and adapted
# only slightly.
def write_test_db(filename: str):
    enc = mmdbencoder.Encoder(
        ip_version=6,
        record_size=32,
        database_type="test-db",  # name of the table
        languages=["en"],
        description={
            "en": "Database for Testing",
        },
        compat=True,
    )
    be = enc.insert_data({"country": "be"})
    de_iso = enc.insert_data({"country": {"iso_code": "de"}})
    nonsense = enc.insert_data({"foo": "bar"})
    none_country = enc.insert_data({"country": {"iso_code": "None"}})
    enc.insert_network("123.123.123.0/24", be)
    enc.insert_network("2a01:4f8::/32", de_iso)
    enc.insert_network("127.0.0.0/8", nonsense)
    enc.insert_network("1.0.0.0/8", none_country)
    enc.write_file(filename)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="create MMDB database with some entries for use in tests",
    )
    parser.add_argument(
        "filename",
        help="name of the file to create",
    )
    args = parser.parse_args()
    write_test_db(args.filename)
